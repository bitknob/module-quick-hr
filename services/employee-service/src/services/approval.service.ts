import { ApprovalQueries } from '../queries/approval.queries';
import { EmployeeQueries } from '../queries/employee.queries';
import {
  ApprovalRequestType,
  ApprovalStatus,
  ApprovalStepStatus,
  ApprovalAction,
  ApproverType,
  ApprovalPriority,
  UserRole,
} from '@hrm/common';
import { NotFoundError, ValidationError, ForbiddenError } from '@hrm/common';

export interface CreateApprovalRequestInput {
  companyId: string;
  requestType: ApprovalRequestType;
  entityType: string;
  entityId?: string;
  requestedBy: string;
  requestedFor?: string;
  requestData: Record<string, any>;
  priority?: ApprovalPriority;
  expiresAt?: Date;
  approvers?: Array<{
    approverType: ApproverType;
    approverId?: string;
    approverRole?: string;
    isRequired?: boolean;
  }>;
}

export class ApprovalService {
  static async createApprovalRequest(input: CreateApprovalRequestInput): Promise<any> {
    const { approvers, ...requestData } = input;

    const request = await ApprovalQueries.createApprovalRequest({
      ...requestData,
      priority: input.priority || ApprovalPriority.NORMAL,
    });

    if (approvers && approvers.length > 0) {
      const steps = await Promise.all(
        approvers.map((approver, index) =>
          ApprovalQueries.createApprovalStep({
            approvalRequestId: request.id,
            stepNumber: index + 1,
            approverId: approver.approverId,
            approverRole: approver.approverRole,
            approverType: approver.approverType,
            isRequired: approver.isRequired !== false,
            order: index + 1,
          })
        )
      );

      await request.update({
        totalSteps: steps.length,
        currentStep: 1,
      });
    } else {
      const defaultApprover = await this.determineDefaultApprover(
        input.requestedBy,
        input.companyId,
        input.requestType
      );

      if (defaultApprover) {
        await ApprovalQueries.createApprovalStep({
          approvalRequestId: request.id,
          stepNumber: 1,
          approverId: defaultApprover.id,
          approverType: ApproverType.SPECIFIC_USER,
          isRequired: true,
          order: 1,
        });
      }
    }

    await ApprovalQueries.createHistoryEntry({
      approvalRequestId: request.id,
      action: ApprovalAction.CREATED,
      performedBy: input.requestedBy,
    });

    return await ApprovalQueries.findById(request.id);
  }

  static async determineDefaultApprover(
    requestedBy: string,
    companyId: string,
    requestType: ApprovalRequestType
  ): Promise<any> {
    const requester = await EmployeeQueries.findById(requestedBy, companyId);
    if (!requester) {
      throw new NotFoundError('Requester not found');
    }

    if (requester.managerId) {
      const manager = await EmployeeQueries.findById(requester.managerId, companyId);
      return manager;
    }

    return null;
  }

  static async approveRequest(
    requestId: string,
    approverId: string,
    companyId: string,
    comments?: string
  ): Promise<any> {
    const request = await ApprovalQueries.findById(requestId, companyId);
    if (!request) {
      throw new NotFoundError('Approval request not found');
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new ValidationError('Request is not pending approval');
    }

    const currentStep = await ApprovalQueries.findCurrentStep(requestId);
    if (!currentStep) {
      throw new NotFoundError('Current approval step not found');
    }

    if (currentStep.approverId !== approverId) {
      throw new ForbiddenError('You are not authorized to approve this step');
    }

    if (currentStep.status !== ApprovalStepStatus.PENDING) {
      throw new ValidationError('This step has already been processed');
    }

    await ApprovalQueries.updateStepStatus(
      currentStep.id,
      ApprovalStepStatus.APPROVED,
      approverId,
      comments
    );

    await ApprovalQueries.createHistoryEntry({
      approvalRequestId: requestId,
      approvalStepId: currentStep.id,
      action: ApprovalAction.APPROVED,
      performedBy: approverId,
      comments,
    });

    if (request.currentStep >= request.totalSteps) {
      await ApprovalQueries.updateRequestStatus(requestId, ApprovalStatus.APPROVED, new Date());
    } else {
      await ApprovalQueries.moveToNextStep(requestId);
    }

    return await ApprovalQueries.findById(requestId);
  }

  static async rejectRequest(
    requestId: string,
    approverId: string,
    companyId: string,
    rejectionReason: string,
    comments?: string
  ): Promise<any> {
    const request = await ApprovalQueries.findById(requestId, companyId);
    if (!request) {
      throw new NotFoundError('Approval request not found');
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new ValidationError('Request is not pending approval');
    }

    const currentStep = await ApprovalQueries.findCurrentStep(requestId);
    if (!currentStep) {
      throw new NotFoundError('Current approval step not found');
    }

    if (currentStep.approverId !== approverId) {
      throw new ForbiddenError('You are not authorized to reject this step');
    }

    if (currentStep.status !== ApprovalStepStatus.PENDING) {
      throw new ValidationError('This step has already been processed');
    }

    await ApprovalQueries.updateStepStatus(
      currentStep.id,
      ApprovalStepStatus.REJECTED,
      approverId,
      comments,
      rejectionReason
    );

    await ApprovalQueries.updateRequestStatus(
      requestId,
      ApprovalStatus.REJECTED,
      undefined,
      new Date(),
      rejectionReason
    );

    await ApprovalQueries.createHistoryEntry({
      approvalRequestId: requestId,
      approvalStepId: currentStep.id,
      action: ApprovalAction.REJECTED,
      performedBy: approverId,
      comments,
      metadata: { rejectionReason },
    });

    return await ApprovalQueries.findById(requestId);
  }

  static async getApprovalRequest(requestId: string, companyId?: string): Promise<any> {
    const request = await ApprovalQueries.findById(requestId, companyId);
    if (!request) {
      throw new NotFoundError('Approval request not found');
    }

    const steps = await ApprovalQueries.findStepsByRequestId(requestId);
    const history = await ApprovalQueries.findHistoryByRequestId(requestId);

    return {
      ...request.toJSON(),
      steps,
      history,
    };
  }

  static async getApprovalRequests(filters: {
    companyId?: string;
    requestType?: ApprovalRequestType;
    status?: ApprovalStatus;
    requestedBy?: string;
    requestedFor?: string;
    page?: number;
    limit?: number;
  }): Promise<{ requests: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const { requests, total } = await ApprovalQueries.findAll(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      requests,
      total,
      page,
      limit,
      totalPages,
    };
  }

  static async getPendingApprovals(approverId: string, companyId?: string): Promise<any[]> {
    return await ApprovalQueries.findPendingForApprover(approverId, companyId);
  }

  static async cancelRequest(
    requestId: string,
    cancelledBy: string,
    companyId?: string,
    reason?: string
  ): Promise<any> {
    const request = await ApprovalQueries.findById(requestId, companyId);
    if (!request) {
      throw new NotFoundError('Approval request not found');
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new ValidationError('Only pending requests can be cancelled');
    }

    if (request.requestedBy !== cancelledBy) {
      throw new ForbiddenError('Only the requester can cancel the request');
    }

    return await ApprovalQueries.cancelRequest(requestId, cancelledBy, reason);
  }
}
