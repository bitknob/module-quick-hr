import { PayrollArrears } from '../models/PayrollArrears.model';
import { NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';

export class ArrearsService {
  static async createArrears(data: {
    employeeId: string;
    companyId: string;
    arrearsType: 'salary_revision' | 'promotion' | 'retroactive_adjustment' | 'correction' | 'bonus_arrears' | 'allowance_adjustment' | 'other';
    description?: string;
    originalPeriodFrom: Date;
    originalPeriodTo: Date;
    adjustmentAmount: number;
    breakdown?: any;
    reason?: string;
    applicableMonth: number;
    applicableYear: number;
    isTaxable?: boolean;
    taxCalculationBasis?: string;
  }): Promise<PayrollArrears> {
    if (data.applicableMonth < 1 || data.applicableMonth > 12) {
      throw new ValidationError('Invalid applicable month');
    }

    if (data.originalPeriodFrom > data.originalPeriodTo) {
      throw new ValidationError('Original period from date must be before to date');
    }

    const arrears = await PayrollArrears.create({
      id: uuidv4(),
      ...data,
      status: 'pending',
      isTaxable: data.isTaxable ?? true,
    });

    return arrears;
  }

  static async getArrearsById(id: string): Promise<PayrollArrears> {
    const arrears = await PayrollArrears.findByPk(id);
    if (!arrears) {
      throw new NotFoundError('Arrears');
    }
    return arrears;
  }

  static async approveArrears(id: string, approvedBy: string): Promise<PayrollArrears> {
    const arrears = await PayrollArrears.findByPk(id);
    if (!arrears) {
      throw new NotFoundError('Arrears');
    }

    await arrears.update({
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });

    return arrears;
  }

  static async getArrearsByEmployee(
    employeeId: string,
    month?: number,
    year?: number,
    status?: string
  ): Promise<PayrollArrears[]> {
    const where: any = { employeeId };

    if (month) where.applicableMonth = month;
    if (year) where.applicableYear = year;
    if (status) where.status = status;

    return await PayrollArrears.findAll({
      where,
      order: [['applicableYear', 'DESC'], ['applicableMonth', 'DESC']],
    });
  }

  static async getApprovedArrearsForMonth(
    employeeId: string,
    month: number,
    year: number
  ): Promise<PayrollArrears[]> {
    return await PayrollArrears.findAll({
      where: {
        employeeId,
        applicableMonth: month,
        applicableYear: year,
        status: 'approved',
      },
    });
  }

  static async markAsProcessed(
    id: string,
    payrollRunId: string,
    payslipId: string
  ): Promise<PayrollArrears> {
    const arrears = await PayrollArrears.findByPk(id);
    if (!arrears) {
      throw new NotFoundError('Arrears');
    }

    await arrears.update({
      status: 'processed',
      payrollRunId,
      payslipId,
      processedAt: new Date(),
    });

    return arrears;
  }
}

