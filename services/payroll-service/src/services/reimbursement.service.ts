import { PayrollReimbursement } from '../models/PayrollReimbursement.model';
import { NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';

export class ReimbursementService {
  static async createReimbursement(data: {
    employeeId: string;
    companyId: string;
    reimbursementType: 'travel' | 'medical' | 'meal' | 'telephone' | 'internet' | 'fuel' | 'conveyance' | 'other';
    description?: string;
    claimAmount: number;
    claimDate: Date;
    documents?: string[];
    expenseBreakdown?: any;
    applicableMonth: number;
    applicableYear: number;
    isTaxable?: boolean;
    taxExemptionLimit?: number;
  }): Promise<PayrollReimbursement> {
    if (data.applicableMonth < 1 || data.applicableMonth > 12) {
      throw new ValidationError('Invalid applicable month');
    }

    const reimbursement = await PayrollReimbursement.create({
      id: uuidv4(),
      ...data,
      status: 'draft',
      approvedAmount: 0,
      isTaxable: data.isTaxable ?? false,
    });

    return reimbursement;
  }

  static async getReimbursementById(id: string): Promise<PayrollReimbursement> {
    const reimbursement = await PayrollReimbursement.findByPk(id);
    if (!reimbursement) {
      throw new NotFoundError('Reimbursement');
    }
    return reimbursement;
  }

  static async submitReimbursement(id: string): Promise<PayrollReimbursement> {
    const reimbursement = await PayrollReimbursement.findByPk(id);
    if (!reimbursement) {
      throw new NotFoundError('Reimbursement');
    }

    await reimbursement.update({
      status: 'submitted',
    });

    return reimbursement;
  }

  static async approveReimbursement(
    id: string,
    approvedAmount: number,
    approvedBy: string
  ): Promise<PayrollReimbursement> {
    const reimbursement = await PayrollReimbursement.findByPk(id);
    if (!reimbursement) {
      throw new NotFoundError('Reimbursement');
    }

    if (approvedAmount > reimbursement.claimAmount) {
      throw new ValidationError('Approved amount cannot exceed claim amount');
    }

    await reimbursement.update({
      status: 'approved',
      approvedAmount,
      approvedBy,
      approvedAt: new Date(),
    });

    return reimbursement;
  }

  static async rejectReimbursement(
    id: string,
    rejectionReason: string
  ): Promise<PayrollReimbursement> {
    const reimbursement = await PayrollReimbursement.findByPk(id);
    if (!reimbursement) {
      throw new NotFoundError('Reimbursement');
    }

    await reimbursement.update({
      status: 'rejected',
      rejectionReason,
    });

    return reimbursement;
  }

  static async getReimbursementsByEmployee(
    employeeId: string,
    month?: number,
    year?: number,
    status?: string,
    reimbursementType?: string
  ): Promise<PayrollReimbursement[]> {
    const where: any = { employeeId };

    if (month) where.applicableMonth = month;
    if (year) where.applicableYear = year;
    if (status) where.status = status;
    if (reimbursementType) where.reimbursementType = reimbursementType;

    return await PayrollReimbursement.findAll({
      where,
      order: [['claimDate', 'DESC']],
    });
  }

  static async getApprovedReimbursementsForMonth(
    employeeId: string,
    month: number,
    year: number
  ): Promise<PayrollReimbursement[]> {
    return await PayrollReimbursement.findAll({
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
  ): Promise<PayrollReimbursement> {
    const reimbursement = await PayrollReimbursement.findByPk(id);
    if (!reimbursement) {
      throw new NotFoundError('Reimbursement');
    }

    await reimbursement.update({
      status: 'processed',
      payrollRunId,
      payslipId,
      processedAt: new Date(),
    });

    return reimbursement;
  }
}

