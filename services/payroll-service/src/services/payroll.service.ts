import {
  PayrollRun,
  Payslip,
  EmployeeSalaryStructure,
  SalaryStructure,
  PayrollComponent,
  TaxConfiguration,
  PayrollVariablePay,
  PayrollArrears,
  PayrollReimbursement,
  PayrollLoan,
  PayrollLoanDeduction,
  EmployeeTaxDeclaration,
} from '../models';
import { TaxCalculationService } from './taxCalculation.service';
import { VariablePayService } from './variablePay.service';
import { ArrearsService } from './arrears.service';
import { ReimbursementService } from './reimbursement.service';
import { LoanService } from './loan.service';
import { NotFoundError, ValidationError, ConflictError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class PayrollService {
  static async createPayrollRun(data: {
    companyId: string;
    payrollMonth: number;
    payrollYear: number;
    processedBy?: string;
  }): Promise<PayrollRun> {
    if (data.payrollMonth < 1 || data.payrollMonth > 12) {
      throw new ValidationError('Invalid payroll month');
    }

    const existing = await PayrollRun.findOne({
      where: {
        companyId: data.companyId,
        payrollMonth: data.payrollMonth,
        payrollYear: data.payrollYear,
      },
    });

    if (existing) {
      throw new ConflictError('Payroll run already exists for this month and year');
    }

    const payrollRun = await PayrollRun.create({
      id: uuidv4(),
      ...data,
      status: 'draft',
      totalEmployees: 0,
      processedEmployees: 0,
      failedEmployees: 0,
      totalGrossSalary: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
    });

    return payrollRun;
  }

  static async processPayrollRun(payrollRunId: string, processedBy: string): Promise<PayrollRun> {
    const payrollRun = await PayrollRun.findByPk(payrollRunId);
    if (!payrollRun) {
      throw new NotFoundError('Payroll run');
    }

    if (payrollRun.status === 'locked') {
      throw new ValidationError('Payroll run is locked and cannot be processed');
    }

    if (payrollRun.status === 'completed') {
      throw new ValidationError('Payroll run is already completed');
    }

    await payrollRun.update({
      status: 'processing',
      processedBy,
    });

    try {
      const financialYear = this.getFinancialYear(payrollRun.payrollMonth, payrollRun.payrollYear);
      
      const taxConfig = await TaxConfiguration.findOne({
        where: {
          companyId: payrollRun.companyId,
          financialYear: financialYear,
        },
        order: [['country', 'ASC']],
      });

      if (!taxConfig) {
        throw new NotFoundError('Tax configuration for this financial year');
      }

      const employees = await sequelize.query(
        `SELECT e.id, e."companyId", e."employeeId", e."firstName", e."lastName", e.email
         FROM "Employees" e
         WHERE e."companyId" = :companyId AND e.status = 'active'`,
        {
          replacements: { companyId: payrollRun.companyId },
          type: QueryTypes.SELECT,
        }
      );

      let processedCount = 0;
      let failedCount = 0;
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const employee of employees as any[]) {
        try {
          const payslip = await this.generatePayslipForEmployee(
            employee.id,
            payrollRun.id,
            payrollRun.companyId,
            payrollRun.payrollMonth,
            payrollRun.payrollYear,
            taxConfig
          );

          processedCount++;
          totalGross += Number(payslip.grossSalary);
          totalDeductions += Number(payslip.totalDeductions);
          totalNet += Number(payslip.netSalary);
        } catch (error) {
          failedCount++;
        }
      }

      await payrollRun.update({
        status: 'completed',
        processedEmployees: processedCount,
        failedEmployees: failedCount,
        totalEmployees: employees.length,
        totalGrossSalary: totalGross,
        totalDeductions: totalDeductions,
        totalNetSalary: totalNet,
        processedAt: new Date(),
      });

      return payrollRun;
    } catch (error) {
      await payrollRun.update({
        status: 'failed',
      });
      throw error;
    }
  }

  static async generatePayslipForEmployee(
    employeeId: string,
    payrollRunId: string,
    companyId: string,
    month: number,
    year: number,
    taxConfig: TaxConfiguration
  ): Promise<Payslip> {
    const employeeStructure = await EmployeeSalaryStructure.findOne({
      where: {
        employeeId,
        companyId,
        isActive: true,
      },
      include: [
        {
          model: SalaryStructure,
          as: 'salaryStructure',
          include: [
            {
              model: PayrollComponent,
              as: 'components',
              where: { isActive: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!employeeStructure) {
      throw new NotFoundError('Employee salary structure');
    }

    const monthlyCTC = Number(employeeStructure.ctc) / 12;
    const structure = employeeStructure.salaryStructure as SalaryStructure;
    const components = (structure as any).components as PayrollComponent[];

    const earningsBreakdown: Record<string, number> = {};
    const deductionsBreakdown: Record<string, number> = {};
    let basicSalary = 0;
    let hraReceived = 0;
    let ltaReceived = 0;
    let totalEarnings = 0;
    let totalDeductions = 0;

    for (const component of components) {
      let amount = 0;

      if (component.isPercentage) {
        if (component.percentageOf === 'ctc' || !component.percentageOf) {
          amount = (monthlyCTC * Number(component.value)) / 100;
        } else if (component.percentageOf === 'basic') {
          amount = (basicSalary * Number(component.value)) / 100;
        }
      } else {
        amount = Number(component.value);
      }

      if (component.componentType === 'earning') {
        earningsBreakdown[component.componentName] = Math.round(amount);
        totalEarnings += amount;

        if (component.componentCategory === 'basic') {
          basicSalary = amount;
        } else if (component.componentCategory === 'hra') {
          hraReceived = amount;
        } else if (component.componentCategory === 'lta') {
          ltaReceived = amount;
        }
      } else {
        if (!component.isStatutory) {
          deductionsBreakdown[component.componentName] = Math.round(amount);
          totalDeductions += amount;
        }
      }
    }

    const grossSalary = totalEarnings;
    const monthlyTaxableIncome = grossSalary - totalDeductions;
    const annualTaxableIncome = monthlyTaxableIncome * 12;

    const taxResult = TaxCalculationService.calculateAllTaxes(
      grossSalary,
      basicSalary,
      hraReceived,
      ltaReceived,
      taxConfig,
      monthlyTaxableIncome,
      annualTaxableIncome
    );

    totalDeductions += taxResult.incomeTaxAmount;
    totalDeductions += taxResult.localTaxAmount;
    totalDeductions += taxResult.socialSecurityEmployeeAmount;
    totalDeductions += taxResult.healthInsuranceEmployeeAmount;

    deductionsBreakdown['Income Tax'] = taxResult.incomeTaxAmount;
    deductionsBreakdown['Local Tax'] = taxResult.localTaxAmount;
    
    if (taxResult.socialSecurityEmployeeAmount > 0) {
      deductionsBreakdown['Social Security (Employee)'] = taxResult.socialSecurityEmployeeAmount;
    }
    
    if (taxResult.healthInsuranceEmployeeAmount > 0) {
      deductionsBreakdown['Health Insurance (Employee)'] = taxResult.healthInsuranceEmployeeAmount;
    }

    const attendanceData = await this.getAttendanceData(employeeId, companyId, month, year);
    const workingDays = attendanceData.workingDays;
    const presentDays = attendanceData.presentDays;
    const absentDays = attendanceData.absentDays;
    const leaveDays = attendanceData.leaveDays;

    const proRataFactor = workingDays > 0 ? presentDays / workingDays : 1.0;
    const lossOfPayDays = absentDays - leaveDays;
    const lossOfPayAmount = lossOfPayDays > 0 ? (grossSalary / workingDays) * lossOfPayDays : 0;

    const adjustedGrossSalary = grossSalary * proRataFactor - lossOfPayAmount;

    const variablePays = await VariablePayService.getApprovedVariablePayForMonth(employeeId, month, year);
    let variablePayTotal = 0;
    const variablePayBreakdown: Record<string, number> = {};
    for (const vp of variablePays) {
      variablePayTotal += Number(vp.amount);
      variablePayBreakdown[vp.variablePayType] = (variablePayBreakdown[vp.variablePayType] || 0) + Number(vp.amount);
    }

    const arrears = await ArrearsService.getApprovedArrearsForMonth(employeeId, month, year);
    let arrearsTotal = 0;
    const arrearsBreakdown: Record<string, number> = {};
    for (const arr of arrears) {
      arrearsTotal += Number(arr.adjustmentAmount);
      arrearsBreakdown[arr.arrearsType] = (arrearsBreakdown[arr.arrearsType] || 0) + Number(arr.adjustmentAmount);
    }

    const reimbursements = await ReimbursementService.getApprovedReimbursementsForMonth(employeeId, month, year);
    let reimbursementTotal = 0;
    const reimbursementBreakdown: Record<string, number> = {};
    for (const reimb of reimbursements) {
      reimbursementTotal += Number(reimb.approvedAmount);
      reimbursementBreakdown[reimb.reimbursementType] = (reimbursementBreakdown[reimb.reimbursementType] || 0) + Number(reimb.approvedAmount);
    }

    const activeLoans = await LoanService.getActiveLoansByEmployee(employeeId);
    let loanDeductionTotal = 0;
    const loanDeductionBreakdown: Record<string, number> = {};
    const loansToDeduct: Array<{ loan: PayrollLoan; scheduleEntry: any }> = [];

    for (const loan of activeLoans) {
      const deductionDate = new Date(year, month - 1, 1);
      const deductionStart = new Date(loan.deductionStartYear, loan.deductionStartMonth - 1, 1);

      if (deductionDate >= deductionStart && loan.status === 'active') {
        const schedule = loan.repaymentSchedule as any[];
        if (schedule && schedule.length > 0) {
          const monthNumber = this.getLoanMonthNumber(month, year, loan.startDate);
          if (monthNumber > 0 && monthNumber <= schedule.length) {
            const scheduleEntry = schedule[monthNumber - 1];
            loanDeductionTotal += Number(scheduleEntry.emiAmount);
            loanDeductionBreakdown[loan.loanType] = (loanDeductionBreakdown[loan.loanType] || 0) + Number(scheduleEntry.emiAmount);
            loansToDeduct.push({ loan, scheduleEntry });
          }
        }
      }
    }

    const finalGrossSalary = adjustedGrossSalary + variablePayTotal + arrearsTotal + reimbursementTotal;
    const finalTaxableIncome = finalGrossSalary * 12;
    const finalTaxResult = TaxCalculationService.calculateAllTaxes(
      finalGrossSalary,
      basicSalary * proRataFactor,
      hraReceived * proRataFactor,
      ltaReceived * proRataFactor,
      taxConfig,
      finalGrossSalary - totalDeductions,
      finalTaxableIncome
    );

    totalDeductions += finalTaxResult.incomeTaxAmount;
    totalDeductions += finalTaxResult.localTaxAmount;
    totalDeductions += finalTaxResult.socialSecurityEmployeeAmount;
    totalDeductions += finalTaxResult.healthInsuranceEmployeeAmount;
    totalDeductions += loanDeductionTotal;

    deductionsBreakdown['Income Tax'] = finalTaxResult.incomeTaxAmount;
    deductionsBreakdown['Local Tax'] = finalTaxResult.localTaxAmount;
    
    if (finalTaxResult.socialSecurityEmployeeAmount > 0) {
      deductionsBreakdown['Social Security (Employee)'] = finalTaxResult.socialSecurityEmployeeAmount;
    }
    
    if (finalTaxResult.healthInsuranceEmployeeAmount > 0) {
      deductionsBreakdown['Health Insurance (Employee)'] = finalTaxResult.healthInsuranceEmployeeAmount;
    }

    if (loanDeductionTotal > 0) {
      deductionsBreakdown['Loan Deductions'] = loanDeductionTotal;
    }

    const netSalary = finalGrossSalary - totalDeductions;

    const ytdData = await this.calculateYTDFigures(employeeId, month, year);

    const payslipNumber = this.generatePayslipNumber(companyId, employeeId, month, year);

    const payslip = await Payslip.create({
      id: uuidv4(),
      employeeId,
      companyId,
      payrollRunId,
      payslipNumber,
      month,
      year,
      status: 'generated',
      ctc: employeeStructure.ctc,
      grossSalary: finalGrossSalary,
      totalEarnings: finalGrossSalary,
      totalDeductions,
      netSalary,
      earningsBreakdown,
      deductionsBreakdown,
      tdsAmount: finalTaxResult.incomeTaxAmount,
      professionalTaxAmount: finalTaxResult.localTaxAmount,
      epfEmployeeAmount: finalTaxResult.socialSecurityEmployeeAmount,
      epfEmployerAmount: finalTaxResult.socialSecurityEmployerAmount,
      esiEmployeeAmount: finalTaxResult.healthInsuranceEmployeeAmount,
      esiEmployerAmount: finalTaxResult.healthInsuranceEmployerAmount,
      workingDays,
      presentDays,
      absentDays,
      leaveDays,
      variablePayTotal,
      arrearsTotal,
      reimbursementTotal,
      loanDeductionTotal,
      proRataDays: presentDays,
      proRataFactor,
      lossOfPayDays,
      lossOfPayAmount,
      variablePayBreakdown,
      arrearsBreakdown,
      reimbursementBreakdown,
      loanDeductionBreakdown,
      taxExemptions: finalTaxResult.taxExemptions,
      taxableIncome: finalTaxResult.taxableIncome,
      ytdGrossSalary: ytdData.ytdGross + finalGrossSalary,
      ytdDeductions: ytdData.ytdDeductions + totalDeductions,
      ytdNetSalary: ytdData.ytdNet + netSalary,
      ytdTaxDeducted: ytdData.ytdTax + finalTaxResult.incomeTaxAmount,
    });

    for (const vp of variablePays) {
      await VariablePayService.markAsProcessed(vp.id, payrollRunId, payslip.id);
    }

    for (const arr of arrears) {
      await ArrearsService.markAsProcessed(arr.id, payrollRunId, payslip.id);
    }

    for (const reimb of reimbursements) {
      await ReimbursementService.markAsProcessed(reimb.id, payrollRunId, payslip.id);
    }

    for (const { loan, scheduleEntry } of loansToDeduct) {
      try {
        await LoanService.recordLoanDeduction({
          loanId: loan.id,
          employeeId,
          companyId,
          payrollRunId,
          payslipId: payslip.id,
          deductionMonth: month,
          deductionYear: year,
        });
      } catch (error) {
        
      }
    }

    return payslip;
  }

  static async getPayrollRunById(id: string): Promise<PayrollRun> {
    const payrollRun = await PayrollRun.findByPk(id);
    if (!payrollRun) {
      throw new NotFoundError('Payroll run');
    }
    return payrollRun;
  }

  static async getPayrollRunsByCompany(
    companyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ rows: PayrollRun[]; count: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await PayrollRun.findAndCountAll({
      where: { companyId },
      order: [['payrollYear', 'DESC'], ['payrollMonth', 'DESC']],
      limit,
      offset,
    });

    return { rows, count };
  }

  static async getPayslipById(id: string): Promise<Payslip> {
    const payslip = await Payslip.findByPk(id, {
      include: [
        {
          model: PayrollRun,
          as: 'payrollRun',
        },
      ],
    });

    if (!payslip) {
      throw new NotFoundError('Payslip');
    }

    return payslip;
  }

  static async getPayslipsByEmployee(
    employeeId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ rows: Payslip[]; count: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await Payslip.findAndCountAll({
      where: { employeeId },
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit,
      offset,
    });

    return { rows, count };
  }

  static async getPayslipsByPayrollRun(
    payrollRunId: string,
    page: number = 1,
    limit: number = 100
  ): Promise<{ rows: Payslip[]; count: number }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await Payslip.findAndCountAll({
      where: { payrollRunId },
      order: [['payslipNumber', 'ASC']],
      limit,
      offset,
    });

    return { rows, count };
  }

  static async lockPayrollRun(id: string, lockedBy: string): Promise<PayrollRun> {
    const payrollRun = await PayrollRun.findByPk(id);
    if (!payrollRun) {
      throw new NotFoundError('Payroll run');
    }

    if (payrollRun.status !== 'completed') {
      throw new ValidationError('Only completed payroll runs can be locked');
    }

    await payrollRun.update({
      status: 'locked',
      lockedAt: new Date(),
      lockedBy,
    });

    return payrollRun;
  }

  private static generatePayslipNumber(
    companyId: string,
    employeeId: string,
    month: number,
    year: number
  ): string {
    const monthStr = month.toString().padStart(2, '0');
    const companyPrefix = companyId.substring(0, 8).toUpperCase();
    const employeePrefix = employeeId.substring(0, 8).toUpperCase();
    return `PSL-${companyPrefix}-${employeePrefix}-${year}${monthStr}`;
  }

  private static getFinancialYear(month: number, year: number): string {
    if (month >= 4) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  private static getLoanMonthNumber(
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

  private static async getAttendanceData(
    employeeId: string,
    companyId: string,
    month: number,
    year: number
  ): Promise<{ workingDays: number; presentDays: number; absentDays: number; leaveDays: number }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await sequelize.query(
      `SELECT status, date 
       FROM "Attendance" 
       WHERE "employeeId" = :employeeId 
       AND "companyId" = :companyId
       AND date >= :startDate 
       AND date <= :endDate`,
      {
        replacements: { employeeId, companyId, startDate, endDate },
        type: QueryTypes.SELECT,
      }
    );

    const leaveRecords = await sequelize.query(
      `SELECT "startDate", "endDate" 
       FROM "LeaveRequests" 
       WHERE "employeeId" = :employeeId 
       AND "companyId" = :companyId
       AND status = 'approved'
       AND ("startDate" <= :endDate AND "endDate" >= :startDate)`,
      {
        replacements: { employeeId, companyId, startDate, endDate },
        type: QueryTypes.SELECT,
      }
    );

    const totalDays = endDate.getDate();
    let presentDays = 0;
    let absentDays = 0;
    let leaveDays = 0;

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      const attendance = (attendanceRecords as any[]).find((a: any) => {
        const attDate = new Date(a.date);
        return attDate.getDate() === day && attDate.getMonth() === month - 1;
      });

      const isOnLeave = (leaveRecords as any[]).some((l: any) => {
        const leaveStart = new Date(l.startDate);
        const leaveEnd = new Date(l.endDate);
        return currentDate >= leaveStart && currentDate <= leaveEnd;
      });

      if (isOnLeave) {
        leaveDays++;
        presentDays++;
      } else if (attendance) {
        if (attendance.status === 'present' || attendance.status === 'late' || attendance.status === 'half_day') {
          presentDays++;
        } else {
          absentDays++;
        }
      } else {
        absentDays++;
      }
    }

    return {
      workingDays: totalDays,
      presentDays,
      absentDays,
      leaveDays,
    };
  }

  private static async calculateYTDFigures(
    employeeId: string,
    month: number,
    year: number
  ): Promise<{ ytdGross: number; ytdDeductions: number; ytdNet: number; ytdTax: number }> {
    const previousPayslips = await Payslip.findAll({
      where: {
        employeeId,
        year,
        month: { [Op.lt]: month },
        status: { [Op.in]: ['generated', 'approved', 'sent', 'downloaded'] },
      },
      attributes: ['grossSalary', 'totalDeductions', 'netSalary', 'tdsAmount'],
    });

    let ytdGross = 0;
    let ytdDeductions = 0;
    let ytdNet = 0;
    let ytdTax = 0;

    for (const payslip of previousPayslips) {
      ytdGross += Number(payslip.grossSalary);
      ytdDeductions += Number(payslip.totalDeductions);
      ytdNet += Number(payslip.netSalary);
      ytdTax += Number(payslip.tdsAmount);
    }

    return { ytdGross, ytdDeductions, ytdNet, ytdTax };
  }
}

