import { LeaveRequest } from '../models/LeaveRequest.model';
import { LeaveQueries } from '../queries/leave.queries';
import { EmployeeQueries } from '../queries/employee.queries';
import { ConflictError, NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { LeaveType, LeaveStatus } from '@hrm/common';

export class LeaveService {
  static async createLeaveRequest(data: {
    employeeId: string;
    companyId: string;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    reason?: string;
  }): Promise<LeaveRequest> {
    const employee = await EmployeeQueries.findById(data.employeeId, data.companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    if (employee.companyId !== data.companyId) {
      throw new ValidationError('Employee does not belong to the specified company');
    }

    if (employee.status !== 'active') {
      throw new ValidationError('Only active employees can request leave');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) {
      throw new ValidationError('End date cannot be before start date');
    }

    if (startDate < new Date()) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new ValidationError('Start date cannot be in the past');
      }
    }

    const overlappingLeaves = await LeaveQueries.checkOverlappingLeaves(
      data.employeeId,
      startDate,
      endDate
    );

    if (overlappingLeaves.length > 0) {
      throw new ConflictError(
        'Leave request overlaps with existing approved or pending leave'
      );
    }

    return await LeaveRequest.create({
      id: uuidv4(),
      employeeId: data.employeeId,
      companyId: data.companyId,
      leaveType: data.leaveType,
      startDate: startDate,
      endDate: endDate,
      reason: data.reason,
      status: LeaveStatus.PENDING,
    });
  }

  static async getLeaveRequestById(id: string, companyId?: string): Promise<LeaveRequest> {
    const leaveRequest = await LeaveQueries.findById(id, companyId);
    if (!leaveRequest) {
      throw new NotFoundError('Leave request');
    }
    return leaveRequest;
  }

  static async updateLeaveRequest(
    id: string,
    data: Partial<{
      leaveType: LeaveType;
      startDate: Date;
      endDate: Date;
      reason: string;
    }>,
    companyId?: string
  ): Promise<LeaveRequest> {
    const leaveRequest = await LeaveQueries.findById(id, companyId);
    if (!leaveRequest) {
      throw new NotFoundError('Leave request');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new ValidationError('Only pending leave requests can be updated');
    }

    const startDate = data.startDate ? new Date(data.startDate) : leaveRequest.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : leaveRequest.endDate;
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) {
      throw new ValidationError('End date cannot be before start date');
    }

    const overlappingLeaves = await LeaveQueries.checkOverlappingLeaves(
      leaveRequest.employeeId,
      startDate,
      endDate,
      id
    );

    if (overlappingLeaves.length > 0) {
      throw new ConflictError(
        'Updated leave request overlaps with existing approved or pending leave'
      );
    }

    await LeaveRequest.update(data as any, { where: { id } });
    return await LeaveQueries.findById(id, companyId) as LeaveRequest;
  }

  static async deleteLeaveRequest(id: string, companyId?: string): Promise<void> {
    const leaveRequest = await LeaveQueries.findById(id, companyId);
    if (!leaveRequest) {
      throw new NotFoundError('Leave request');
    }

    if (leaveRequest.status === LeaveStatus.APPROVED) {
      throw new ValidationError('Cannot delete approved leave request');
    }

    await LeaveRequest.destroy({ where: { id } });
  }

  static async cancelLeaveRequest(id: string, companyId?: string): Promise<LeaveRequest> {
    const leaveRequest = await LeaveQueries.findById(id, companyId);
    if (!leaveRequest) {
      throw new NotFoundError('Leave request');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new ValidationError('Only pending leave requests can be cancelled');
    }

    await LeaveRequest.update(
      { status: LeaveStatus.CANCELLED },
      { where: { id } }
    );

    return await LeaveQueries.findById(id, companyId) as LeaveRequest;
  }

  static async approveLeaveRequest(
    id: string,
    approverId: string,
    companyId?: string
  ): Promise<LeaveRequest> {
    const leaveRequest = await LeaveQueries.findById(id, companyId);
    if (!leaveRequest) {
      throw new NotFoundError('Leave request');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new ValidationError('Only pending leave requests can be approved');
    }

    const approver = await EmployeeQueries.findById(approverId, companyId);
    if (!approver) {
      throw new NotFoundError('Approver');
    }

    const overlappingLeaves = await LeaveQueries.checkOverlappingLeaves(
      leaveRequest.employeeId,
      leaveRequest.startDate,
      leaveRequest.endDate,
      id
    );

    if (overlappingLeaves.length > 0) {
      throw new ConflictError(
        'Cannot approve leave request that overlaps with existing approved leave'
      );
    }

    await LeaveRequest.update(
      {
        status: LeaveStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      { where: { id } }
    );

    return await LeaveQueries.findById(id, companyId) as LeaveRequest;
  }

  static async rejectLeaveRequest(
    id: string,
    approverId: string,
    companyId?: string
  ): Promise<LeaveRequest> {
    const leaveRequest = await LeaveQueries.findById(id, companyId);
    if (!leaveRequest) {
      throw new NotFoundError('Leave request');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new ValidationError('Only pending leave requests can be rejected');
    }

    const approver = await EmployeeQueries.findById(approverId, companyId);
    if (!approver) {
      throw new NotFoundError('Approver');
    }

    await LeaveRequest.update(
      {
        status: LeaveStatus.REJECTED,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      { where: { id } }
    );

    return await LeaveQueries.findById(id, companyId) as LeaveRequest;
  }

  static async getLeavesByEmployee(
    employeeId: string,
    companyId?: string,
    startDate?: Date,
    endDate?: Date,
    status?: LeaveStatus
  ): Promise<LeaveRequest[]> {
    const employee = await EmployeeQueries.findById(employeeId, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    return await LeaveQueries.findByEmployee(employeeId, companyId, startDate, endDate, status);
  }

  static async getLeavesByCompany(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    status?: LeaveStatus,
    leaveType?: LeaveType
  ): Promise<LeaveRequest[]> {
    return await LeaveQueries.findByCompany(companyId, startDate, endDate, status, leaveType);
  }

  static async getPendingLeavesForApprover(
    approverId: string,
    companyId?: string
  ): Promise<LeaveRequest[]> {
    const approver = await EmployeeQueries.findById(approverId, companyId);
    if (!approver) {
      throw new NotFoundError('Approver');
    }

    return await LeaveQueries.findPendingByApprover(approverId, companyId);
  }

  static async searchLeaves(
    filters: {
      companyId?: string;
      employeeId?: string;
      startDate?: Date;
      endDate?: Date;
      status?: LeaveStatus;
      leaveType?: LeaveType;
    },
    page: number = 1,
    limit: number = 20
  ) {
    return await LeaveQueries.searchLeaves(filters, page, limit);
  }
}

