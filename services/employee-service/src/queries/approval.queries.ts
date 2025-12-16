import { Op } from 'sequelize';
import { ApprovalRequest } from '../models/ApprovalRequest.model';
import { ApprovalStep } from '../models/ApprovalStep.model';
import { ApprovalHistory } from '../models/ApprovalHistory.model';
import { Employee } from '../models/Employee.model';
import {
  ApprovalRequestType,
  ApprovalStatus,
  ApprovalStepStatus,
  ApprovalAction,
  ApprovalPriority,
  ApproverType,
} from '@hrm/common';

export class ApprovalQueries {
  static async createApprovalRequest(data: {
    companyId: string;
    requestType: ApprovalRequestType;
    entityType: string;
    entityId?: string;
    requestedBy: string;
    requestedFor?: string;
    requestData: Record<string, any>;
    priority?: ApprovalPriority;
    expiresAt?: Date;
  }): Promise<ApprovalRequest> {
    return await ApprovalRequest.create({
      ...data,
      currentStep: 1,
      totalSteps: 1,
      status: ApprovalStatus.PENDING,
    });
  }

  static async findById(id: string, companyId?: string): Promise<ApprovalRequest | null> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    return await ApprovalRequest.findOne({
      where,
      include: [
        {
          model: Employee,
          as: 'requestedByEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
        {
          model: Employee,
          as: 'requestedForEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
      ],
    });
  }

  static async findAll(filters: {
    companyId?: string;
    requestType?: ApprovalRequestType;
    status?: ApprovalStatus;
    requestedBy?: string;
    requestedFor?: string;
    page?: number;
    limit?: number;
  }): Promise<{ requests: ApprovalRequest[]; total: number }> {
    const where: any = {};
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    if (filters.requestType) {
      where.requestType = filters.requestType;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.requestedBy) {
      where.requestedBy = filters.requestedBy;
    }
    if (filters.requestedFor) {
      where.requestedFor = filters.requestedFor;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await ApprovalRequest.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'requestedByEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
        {
          model: Employee,
          as: 'requestedForEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return { requests: rows, total: count };
  }

  static async findPendingForApprover(
    approverId: string,
    companyId?: string
  ): Promise<ApprovalRequest[]> {
    const where: any = {
      status: ApprovalStatus.PENDING,
    };
    if (companyId) {
      where.companyId = companyId;
    }

    const pendingSteps = await ApprovalStep.findAll({
      where: {
        approverId,
        status: ApprovalStepStatus.PENDING,
      },
      include: [
        {
          model: ApprovalRequest,
          as: 'approvalRequest',
          where,
          required: true,
        },
      ],
      order: [['order', 'ASC']],
    });

    return pendingSteps.map((step) => (step as any).approvalRequest);
  }

  static async createApprovalStep(data: {
    approvalRequestId: string;
    stepNumber: number;
    approverId?: string;
    approverRole?: string;
    approverType: ApproverType;
    isRequired?: boolean;
    order: number;
  }): Promise<ApprovalStep> {
    return await ApprovalStep.create({
      ...data,
      status: ApprovalStepStatus.PENDING,
      isRequired: data.isRequired !== false,
    });
  }

  static async findStepsByRequestId(approvalRequestId: string): Promise<ApprovalStep[]> {
    return await ApprovalStep.findAll({
      where: { approvalRequestId },
      include: [
        {
          model: Employee,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
      ],
      order: [['order', 'ASC']],
    });
  }

  static async findCurrentStep(approvalRequestId: string): Promise<ApprovalStep | null> {
    const request = await ApprovalRequest.findByPk(approvalRequestId);
    if (!request) return null;

    return await ApprovalStep.findOne({
      where: {
        approvalRequestId,
        order: request.currentStep,
      },
      include: [
        {
          model: Employee,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
      ],
    });
  }

  static async updateStepStatus(
    stepId: string,
    status: ApprovalStepStatus,
    approverId: string,
    comments?: string,
    rejectionReason?: string
  ): Promise<ApprovalStep> {
    const step = await ApprovalStep.findByPk(stepId);
    if (!step) {
      throw new Error('Approval step not found');
    }

    const updateData: any = { status };
    if (status === ApprovalStepStatus.APPROVED) {
      updateData.approvedAt = new Date();
    } else if (status === ApprovalStepStatus.REJECTED) {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason;
    }
    if (comments) {
      updateData.comments = comments;
    }

    await step.update(updateData);
    return step;
  }

  static async updateRequestStatus(
    requestId: string,
    status: ApprovalStatus,
    approvedAt?: Date,
    rejectedAt?: Date,
    rejectionReason?: string
  ): Promise<ApprovalRequest> {
    const request = await ApprovalRequest.findByPk(requestId);
    if (!request) {
      throw new Error('Approval request not found');
    }

    const updateData: any = { status };
    if (approvedAt) {
      updateData.approvedAt = approvedAt;
    }
    if (rejectedAt) {
      updateData.rejectedAt = rejectedAt;
      updateData.rejectionReason = rejectionReason;
    }

    await request.update(updateData);
    return request;
  }

  static async moveToNextStep(approvalRequestId: string): Promise<void> {
    const request = await ApprovalRequest.findByPk(approvalRequestId);
    if (!request) {
      throw new Error('Approval request not found');
    }

    if (request.currentStep < request.totalSteps) {
      await request.update({ currentStep: request.currentStep + 1 });
    }
  }

  static async createHistoryEntry(data: {
    approvalRequestId: string;
    approvalStepId?: string;
    action: ApprovalAction;
    performedBy: string;
    performedByRole?: string;
    comments?: string;
    metadata?: Record<string, any>;
  }): Promise<ApprovalHistory> {
    return await ApprovalHistory.create(data);
  }

  static async findHistoryByRequestId(approvalRequestId: string): Promise<ApprovalHistory[]> {
    return await ApprovalHistory.findAll({
      where: { approvalRequestId },
      include: [
        {
          model: Employee,
          as: 'performedByEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  static async cancelRequest(
    requestId: string,
    cancelledBy: string,
    reason?: string
  ): Promise<ApprovalRequest> {
    const request = await ApprovalRequest.findByPk(requestId);
    if (!request) {
      throw new Error('Approval request not found');
    }

    await request.update({
      status: ApprovalStatus.CANCELLED,
    });

    await this.createHistoryEntry({
      approvalRequestId: requestId,
      action: ApprovalAction.CANCELLED,
      performedBy: cancelledBy,
      comments: reason,
    });

    return request;
  }
}
