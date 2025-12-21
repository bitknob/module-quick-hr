import { PayrollVariablePay } from '../models/PayrollVariablePay.model';
import { NotFoundError, ValidationError, ConflictError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

export class VariablePayService {
  static async createVariablePay(data: {
    employeeId: string;
    companyId: string;
    variablePayType: 'bonus' | 'incentive' | 'commission' | 'overtime' | 'shift_allowance' | 'performance_bonus' | 'retention_bonus' | 'other';
    description?: string;
    amount: number;
    calculationBasis?: string;
    calculationDetails?: any;
    applicableMonth: number;
    applicableYear: number;
    isTaxable?: boolean;
    isRecurring?: boolean;
    recurrenceRule?: any;
  }): Promise<PayrollVariablePay> {
    if (data.applicableMonth < 1 || data.applicableMonth > 12) {
      throw new ValidationError('Invalid applicable month');
    }

    const variablePay = await PayrollVariablePay.create({
      id: uuidv4(),
      ...data,
      status: 'draft',
      isTaxable: data.isTaxable ?? true,
      isRecurring: data.isRecurring ?? false,
    });

    return variablePay;
  }

  static async getVariablePayById(id: string): Promise<PayrollVariablePay> {
    const variablePay = await PayrollVariablePay.findByPk(id);
    if (!variablePay) {
      throw new NotFoundError('Variable pay');
    }
    return variablePay;
  }

  static async updateVariablePay(
    id: string,
    data: Partial<PayrollVariablePay>
  ): Promise<PayrollVariablePay> {
    const variablePay = await PayrollVariablePay.findByPk(id);
    if (!variablePay) {
      throw new NotFoundError('Variable pay');
    }

    if (variablePay.status === 'processed') {
      throw new ValidationError('Cannot update processed variable pay');
    }

    await variablePay.update(data);
    return variablePay;
  }

  static async approveVariablePay(id: string, approvedBy: string): Promise<PayrollVariablePay> {
    const variablePay = await PayrollVariablePay.findByPk(id);
    if (!variablePay) {
      throw new NotFoundError('Variable pay');
    }

    await variablePay.update({
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });

    return variablePay;
  }

  static async getVariablePayByEmployee(
    employeeId: string,
    month?: number,
    year?: number,
    status?: string
  ): Promise<PayrollVariablePay[]> {
    const where: any = { employeeId };

    if (month) where.applicableMonth = month;
    if (year) where.applicableYear = year;
    if (status) where.status = status;

    return await PayrollVariablePay.findAll({
      where,
      order: [['applicableYear', 'DESC'], ['applicableMonth', 'DESC']],
    });
  }

  static async getApprovedVariablePayForMonth(
    employeeId: string,
    month: number,
    year: number
  ): Promise<PayrollVariablePay[]> {
    return await PayrollVariablePay.findAll({
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
  ): Promise<PayrollVariablePay> {
    const variablePay = await PayrollVariablePay.findByPk(id);
    if (!variablePay) {
      throw new NotFoundError('Variable pay');
    }

    await variablePay.update({
      status: 'processed',
      payrollRunId,
      payslipId,
      processedAt: new Date(),
    });

    return variablePay;
  }
}

