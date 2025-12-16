import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApprovalService } from '../services/approval.service';
import { ResponseFormatter } from '@hrm/common';
import { EnrichedAuthRequest } from '../middleware/accessControl';
import { ApprovalRequestType, ApprovalStatus, ApproverType, ApprovalPriority } from '@hrm/common';

const createApprovalRequestSchema = z.object({
  requestType: z.nativeEnum(ApprovalRequestType),
  entityType: z.string().min(1),
  entityId: z.string().uuid().optional(),
  requestedFor: z.string().uuid().optional(),
  requestData: z.record(z.any()),
  priority: z.nativeEnum(ApprovalPriority).optional(),
  expiresAt: z.string().datetime().optional(),
  approvers: z
    .array(
      z.object({
        approverType: z.nativeEnum(ApproverType),
        approverId: z.string().uuid().optional(),
        approverRole: z.string().optional(),
        isRequired: z.boolean().optional(),
      })
    )
    .optional(),
});

const approveRequestSchema = z.object({
  comments: z.string().optional(),
});

const rejectRequestSchema = z.object({
  rejectionReason: z.string().min(1),
  comments: z.string().optional(),
});

const cancelRequestSchema = z.object({
  reason: z.string().optional(),
});

export class ApprovalController {
  static async createApprovalRequest(
    req: EnrichedAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.employee) {
        return ResponseFormatter.error(res, 'Employee context not found', '', 400);
      }

      const validatedData = createApprovalRequestSchema.parse(req.body);

      const approvalRequest = await ApprovalService.createApprovalRequest({
        companyId: req.employee.companyId,
        requestedBy: req.employee.id,
        ...validatedData,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      });

      ResponseFormatter.success(
        res,
        approvalRequest,
        'Approval request created successfully',
        `Approval request ${approvalRequest.id} has been created and is pending approval`
      );
    } catch (error) {
      next(error);
    }
  }

  static async getApprovalRequest(
    req: EnrichedAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.employee) {
        return ResponseFormatter.error(res, 'Employee context not found', '', 400);
      }

      const { id } = req.params;
      const approvalRequest = await ApprovalService.getApprovalRequest(id, req.employee.companyId);

      ResponseFormatter.success(res, approvalRequest, 'Approval request retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getApprovalRequests(
    req: EnrichedAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.employee) {
        return ResponseFormatter.error(res, 'Employee context not found', '', 400);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const requestType = req.query.requestType as ApprovalRequestType | undefined;
      const status = req.query.status as ApprovalStatus | undefined;
      const requestedBy = req.query.requestedBy as string | undefined;
      const requestedFor = req.query.requestedFor as string | undefined;

      const result = await ApprovalService.getApprovalRequests({
        companyId: req.employee.companyId,
        requestType,
        status,
        requestedBy,
        requestedFor,
        page,
        limit,
      });

      ResponseFormatter.paginated(
        res,
        result.requests,
        result.total,
        result.page,
        result.limit,
        'Approval requests retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPendingApprovals(
    req: EnrichedAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.employee) {
        return ResponseFormatter.error(res, 'Employee context not found', '', 400);
      }

      const pendingApprovals = await ApprovalService.getPendingApprovals(
        req.employee.id,
        req.employee.companyId
      );

      ResponseFormatter.success(
        res,
        pendingApprovals,
        'Pending approvals retrieved successfully',
        `Found ${pendingApprovals.length} pending approval(s)`
      );
    } catch (error) {
      next(error);
    }
  }

  static async approveRequest(
    req: EnrichedAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.employee) {
        return ResponseFormatter.error(res, 'Employee context not found', '', 400);
      }

      const { id } = req.params;
      const validatedData = approveRequestSchema.parse(req.body);

      const approvalRequest = await ApprovalService.approveRequest(
        id,
        req.employee.id,
        req.employee.companyId,
        validatedData.comments
      );

      ResponseFormatter.success(
        res,
        approvalRequest,
        'Request approved successfully',
        `Approval request ${id} has been approved`
      );
    } catch (error) {
      next(error);
    }
  }

  static async rejectRequest(
    req: EnrichedAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.employee) {
        return ResponseFormatter.error(res, 'Employee context not found', '', 400);
      }

      const { id } = req.params;
      const validatedData = rejectRequestSchema.parse(req.body);

      const approvalRequest = await ApprovalService.rejectRequest(
        id,
        req.employee.id,
        req.employee.companyId,
        validatedData.rejectionReason,
        validatedData.comments
      );

      ResponseFormatter.success(
        res,
        approvalRequest,
        'Request rejected successfully',
        `Approval request ${id} has been rejected: ${validatedData.rejectionReason}`
      );
    } catch (error) {
      next(error);
    }
  }

  static async cancelRequest(
    req: EnrichedAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.employee) {
        return ResponseFormatter.error(res, 'Employee context not found', '', 400);
      }

      const { id } = req.params;
      const validatedData = cancelRequestSchema.parse(req.body);

      const approvalRequest = await ApprovalService.cancelRequest(
        id,
        req.employee.id,
        req.employee.companyId,
        validatedData.reason
      );

      ResponseFormatter.success(
        res,
        approvalRequest,
        'Request cancelled successfully',
        `Approval request ${id} has been cancelled`
      );
    } catch (error) {
      next(error);
    }
  }
}
