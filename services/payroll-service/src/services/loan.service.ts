import { PayrollLoan, PayrollLoanDeduction } from '../models';
import { NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';

export class LoanService {
  static calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    if (tenureMonths <= 0 || annualRate < 0) {
      return 0;
    }

    const monthlyRate = annualRate / 100 / 12;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    return Math.round(emi);
  }

  static generateRepaymentSchedule(
    principal: number,
    annualRate: number,
    tenureMonths: number,
    startDate: Date
  ): any[] {
    const monthlyRate = annualRate / 100 / 12;
    const emi = this.calculateEMI(principal, annualRate, tenureMonths);
    let outstandingPrincipal = principal;
    const schedule: any[] = [];

    for (let month = 1; month <= tenureMonths; month++) {
      const interestComponent = outstandingPrincipal * monthlyRate;
      const principalComponent = emi - interestComponent;
      outstandingPrincipal -= principalComponent;

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + month);

      schedule.push({
        month,
        paymentDate,
        emiAmount: emi,
        principalComponent: Math.round(principalComponent),
        interestComponent: Math.round(interestComponent),
        outstandingBalance: Math.round(Math.max(0, outstandingPrincipal)),
      });
    }

    return schedule;
  }

  static async createLoan(data: {
    employeeId: string;
    companyId: string;
    loanType: 'personal_loan' | 'advance_salary' | 'home_loan' | 'vehicle_loan' | 'education_loan' | 'medical_loan' | 'other';
    loanName?: string;
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    startDate: Date;
    deductionStartMonth: number;
    deductionStartYear: number;
    loanTerms?: any;
  }): Promise<PayrollLoan> {
    const emiAmount = this.calculateEMI(
      data.principalAmount,
      data.interestRate,
      data.tenureMonths
    );

    const endDate = new Date(data.startDate);
    endDate.setMonth(endDate.getMonth() + data.tenureMonths);

    const repaymentSchedule = this.generateRepaymentSchedule(
      data.principalAmount,
      data.interestRate,
      data.tenureMonths,
      data.startDate
    );

    const loan = await PayrollLoan.create({
      id: uuidv4(),
      ...data,
      emiAmount,
      endDate,
      status: 'active',
      outstandingPrincipal: data.principalAmount,
      totalInterestPaid: 0,
      totalAmountPaid: 0,
      repaymentSchedule,
    });

    return loan;
  }

  static async getLoanById(id: string): Promise<PayrollLoan> {
    const loan = await PayrollLoan.findByPk(id, {
      include: [
        {
          model: PayrollLoanDeduction,
          as: 'deductions',
        },
      ],
    });

    if (!loan) {
      throw new NotFoundError('Loan');
    }

    return loan;
  }

  static async getActiveLoansByEmployee(employeeId: string): Promise<PayrollLoan[]> {
    return await PayrollLoan.findAll({
      where: {
        employeeId,
        status: 'active',
      },
      include: [
        {
          model: PayrollLoanDeduction,
          as: 'deductions',
        },
      ],
      order: [['startDate', 'DESC']],
    });
  }

  static async recordLoanDeduction(data: {
    loanId: string;
    employeeId: string;
    companyId: string;
    payrollRunId: string;
    payslipId: string;
    deductionMonth: number;
    deductionYear: number;
  }): Promise<PayrollLoanDeduction> {
    const loan = await PayrollLoan.findByPk(data.loanId);
    if (!loan) {
      throw new NotFoundError('Loan');
    }

    if (loan.status !== 'active') {
      throw new ValidationError('Cannot record deduction for inactive loan');
    }

    const existing = await PayrollLoanDeduction.findOne({
      where: {
        loanId: data.loanId,
        deductionMonth: data.deductionMonth,
        deductionYear: data.deductionYear,
      },
    });

    if (existing) {
      throw new ValidationError('Deduction already recorded for this month and year');
    }

    const schedule = loan.repaymentSchedule as any[];
    const monthNumber = this.getMonthNumber(data.deductionMonth, data.deductionYear, loan.startDate);

    if (!schedule || monthNumber > schedule.length) {
      throw new ValidationError('Invalid deduction period for loan tenure');
    }

    const scheduleEntry = schedule[monthNumber - 1];

    const newOutstanding = Math.max(0, loan.outstandingPrincipal - scheduleEntry.principalComponent);
    const newTotalPaid = loan.totalAmountPaid + scheduleEntry.emiAmount;
    const newInterestPaid = loan.totalInterestPaid + scheduleEntry.interestComponent;

    const updatedStatus = newOutstanding <= 0 ? 'closed' : loan.status;

    await loan.update({
      outstandingPrincipal: newOutstanding,
      totalAmountPaid: newTotalPaid,
      totalInterestPaid: newInterestPaid,
      status: updatedStatus,
    });

    const deduction = await PayrollLoanDeduction.create({
      id: uuidv4(),
      ...data,
      emiAmount: scheduleEntry.emiAmount,
      principalComponent: scheduleEntry.principalComponent,
      interestComponent: scheduleEntry.interestComponent,
      outstandingBalance: newOutstanding,
    });

    return deduction;
  }

  private static getMonthNumber(
    deductionMonth: number,
    deductionYear: number,
    loanStartDate: Date
  ): number {
    const start = new Date(loanStartDate);
    const deduction = new Date(deductionYear, deductionMonth - 1, 1);

    const yearDiff = deduction.getFullYear() - start.getFullYear();
    const monthDiff = deduction.getMonth() - start.getMonth();

    return yearDiff * 12 + monthDiff + 1;
  }

  static async updateLoan(
    id: string,
    data: Partial<PayrollLoan>
  ): Promise<PayrollLoan> {
    const loan = await PayrollLoan.findByPk(id);
    if (!loan) {
      throw new NotFoundError('Loan');
    }

    if (loan.status === 'closed') {
      throw new ValidationError('Cannot update closed loan');
    }

    await loan.update(data);
    return loan;
  }

  static async closeLoan(id: string): Promise<PayrollLoan> {
    const loan = await PayrollLoan.findByPk(id);
    if (!loan) {
      throw new NotFoundError('Loan');
    }

    await loan.update({
      status: 'closed',
    });

    return loan;
  }
}

