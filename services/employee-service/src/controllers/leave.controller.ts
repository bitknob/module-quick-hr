import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole, NotFoundError } from '@hrm/common';
import { LeaveService } from '../services/leave.service';
import { EmployeeQueries } from '../queries/employee.queries';
import { z } from 'zod';
import { LeaveType, LeaveStatus } from '@hrm/common';

const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  leaveType: z.nativeEnum(LeaveType),
  startDate: z.string().or(z.date()).transform((val) => (typeof val === 'string' ? new Date(val) : val)),
  endDate: z.string().or(z.date()).transform((val) => (typeof val === 'string' ? new Date(val) : val)),
  reason: z.string().optional(),
});

const updateLeaveRequestSchema = z.object({
  leaveType: z.nativeEnum(LeaveType).optional(),
  startDate: z.string().or(z.date()).optional().transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  endDate: z.string().or(z.date()).optional().transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  reason: z.string().optional(),
});

export const createLeaveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createLeaveRequestSchema.parse(req.body);
    const leaveRequest = await LeaveService.createLeaveRequest(validatedData);
    const leaveRequestData = leaveRequest.toJSON ? leaveRequest.toJSON() : leaveRequest;

    ResponseFormatter.success(res, leaveRequestData, 'Leave request created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getLeaveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const leaveRequest = await LeaveService.getLeaveRequestById(id, companyId);
    const leaveRequestData = leaveRequest.toJSON ? leaveRequest.toJSON() : leaveRequest;

    ResponseFormatter.success(res, leaveRequestData, 'Leave request retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateLeaveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const validatedData = updateLeaveRequestSchema.parse(req.body);
    const leaveRequest = await LeaveService.updateLeaveRequest(id, validatedData, companyId);
    const leaveRequestData = leaveRequest.toJSON ? leaveRequest.toJSON() : leaveRequest;

    ResponseFormatter.success(res, leaveRequestData, 'Leave request updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const deleteLeaveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    await LeaveService.deleteLeaveRequest(id, companyId);
    ResponseFormatter.success(res, null, 'Leave request deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelLeaveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const leaveRequest = await LeaveService.cancelLeaveRequest(id, companyId);
    const leaveRequestData = leaveRequest.toJSON ? leaveRequest.toJSON() : leaveRequest;

    ResponseFormatter.success(res, leaveRequestData, 'Leave request cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const approveLeaveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.DEPARTMENT_HEAD].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to approve leave request'));
    }

    if (!req.user?.uid) {
      return next(new ValidationError('User ID is required'));
    }

    const leaveRequest = await LeaveService.approveLeaveRequest(id, req.user.uid, companyId);
    const leaveRequestData = leaveRequest.toJSON ? leaveRequest.toJSON() : leaveRequest;

    ResponseFormatter.success(res, leaveRequestData, 'Leave request approved successfully');
  } catch (error) {
    next(error);
  }
};

export const rejectLeaveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.DEPARTMENT_HEAD].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to reject leave request'));
    }

    if (!req.user?.uid) {
      return next(new ValidationError('User ID is required'));
    }

    const leaveRequest = await LeaveService.rejectLeaveRequest(id, req.user.uid, companyId);
    const leaveRequestData = leaveRequest.toJSON ? leaveRequest.toJSON() : leaveRequest;

    ResponseFormatter.success(res, leaveRequestData, 'Leave request rejected successfully');
  } catch (error) {
    next(error);
  }
};

export const getLeavesByEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const status = req.query.status as LeaveStatus | undefined;

    // Check if the employeeId parameter is actually a userId
    // First try to find by employee ID, then by userId
    let actualEmployeeId = employeeId;
    let employee = await EmployeeQueries.findById(employeeId, companyId);
    
    if (!employee) {
      // Try to find by userId
      employee = await EmployeeQueries.findByUserId(employeeId);
      if (employee) {
        actualEmployeeId = employee.id;
      } else {
        // Employee not found - check if it's the current user requesting their own data
        // Users without employee records don't have leaves, so return empty array
        const currentUserId = req.user?.uid || req.user?.userId;
        if (currentUserId && currentUserId === employeeId) {
          ResponseFormatter.success(res, [], 'Leave requests retrieved successfully (no employee record)');
          return;
        }
        // For other users, return 404
        throw new NotFoundError('Employee');
      }
    }

    // Only call service if we found an employee
    const leaves = await LeaveService.getLeavesByEmployee(
      actualEmployeeId,
      companyId,
      startDate,
      endDate,
      status
    );
    const leavesData = leaves.map((l) => (l.toJSON ? l.toJSON() : l));

    ResponseFormatter.success(res, leavesData, 'Leave requests retrieved successfully');
  } catch (error: any) {
    // Handle NotFoundError - if user is requesting their own data, return empty array
    if (error instanceof NotFoundError && error.message?.includes('Employee')) {
      const { employeeId } = req.params;
      const currentUserId = req.user?.uid || req.user?.userId;
      if (currentUserId && currentUserId === employeeId) {
        // User is requesting their own data but has no employee record
        ResponseFormatter.success(res, [], 'Leave requests retrieved successfully (no employee record)');
        return;
      }
    }
    // For other errors, pass to error handler
    next(error);
  }
};

export const getLeavesByCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const status = req.query.status as LeaveStatus | undefined;
    const leaveType = req.query.leaveType as LeaveType | undefined;

    const leaves = await LeaveService.getLeavesByCompany(
      companyId,
      startDate,
      endDate,
      status,
      leaveType
    );
    const leavesData = leaves.map((l) => (l.toJSON ? l.toJSON() : l));

    ResponseFormatter.success(res, leavesData, 'Leave requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPendingLeavesForApprover = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = req.query.companyId as string | undefined;
    if (!req.user?.uid) {
      return next(new ValidationError('User ID is required'));
    }

    const leaves = await LeaveService.getPendingLeavesForApprover(req.user.uid, companyId);
    const leavesData = leaves.map((l) => (l.toJSON ? l.toJSON() : l));

    ResponseFormatter.success(res, leavesData, 'Pending leave requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const searchLeaves = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = {
      companyId: req.query.companyId as string | undefined,
      employeeId: req.query.employeeId as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      status: req.query.status as LeaveStatus | undefined,
      leaveType: req.query.leaveType as LeaveType | undefined,
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await LeaveService.searchLeaves(filters, page, limit);
    const leavesData = result.rows.map((l) => (l.toJSON ? l.toJSON() : l));

    ResponseFormatter.paginated(
      res,
      leavesData,
      result.count,
      page,
      limit,
      'Leave requests retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

