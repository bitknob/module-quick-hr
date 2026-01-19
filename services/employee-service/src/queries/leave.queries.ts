import { Op } from 'sequelize';
import { LeaveRequest } from '../models/LeaveRequest.model';
import { Employee } from '../models/Employee.model';
import { LeaveStatus, LeaveType } from '@hrm/common';

export class LeaveQueries {
  static async findById(id: string, companyId?: string): Promise<LeaveRequest | null> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    return await LeaveRequest.findOne({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
        {
          model: Employee,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
          required: false,
        },
      ],
    });
  }

  static async findByEmployee(
    employeeId: string,
    companyId?: string,
    startDate?: Date,
    endDate?: Date,
    status?: LeaveStatus
  ): Promise<LeaveRequest[]> {
    const where: any = { employeeId };
    if (companyId) {
      where.companyId = companyId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate || endDate) {
      where[Op.or] = [
        {
          startDate: {
            [Op.between]: [startDate || new Date(0), endDate || new Date()],
          },
        },
        {
          endDate: {
            [Op.between]: [startDate || new Date(0), endDate || new Date()],
          },
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startDate || new Date() } },
            { endDate: { [Op.gte]: endDate || new Date() } },
          ],
        },
      ];
    }

    return await LeaveRequest.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
        {
          model: Employee,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
          required: false,
        },
      ],
      order: [['startDate', 'DESC']],
    });
  }

  static async findByCompany(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    status?: LeaveStatus,
    leaveType?: LeaveType
  ): Promise<LeaveRequest[]> {
    const where: any = { companyId };
    if (status) {
      where.status = status;
    }
    if (leaveType) {
      where.leaveType = leaveType;
    }
    if (startDate || endDate) {
      where[Op.or] = [
        {
          startDate: {
            [Op.between]: [startDate || new Date(0), endDate || new Date()],
          },
        },
        {
          endDate: {
            [Op.between]: [startDate || new Date(0), endDate || new Date()],
          },
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startDate || new Date() } },
            { endDate: { [Op.gte]: endDate || new Date() } },
          ],
        },
      ];
    }

    return await LeaveRequest.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
        {
          model: Employee,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
          required: false,
        },
      ],
      order: [['startDate', 'DESC']],
    });
  }

  static async findPendingByApprover(
    approverId: string,
    companyId?: string
  ): Promise<LeaveRequest[]> {
    const where: any = {
      status: 'pending',
    };
    if (companyId) {
      where.companyId = companyId;
    }

    const leaveRequests = await LeaveRequest.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId', 'managerId'],
        },
      ],
      order: [['startDate', 'ASC']],
    });

    return leaveRequests.filter((lr) => {
      const employee = lr.employee;
      if (!employee) return false;
      return employee.managerId === approverId;
    });
  }

  static async checkOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<LeaveRequest[]> {
    const where: any = {
      employeeId,
      status: {
        [Op.in]: ['pending', 'approved'],
      },
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        {
          endDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startDate } },
            { endDate: { [Op.gte]: endDate } },
          ],
        },
      ],
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    return await LeaveRequest.findAll({
      where,
    });
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
  ): Promise<{ rows: LeaveRequest[]; count: number }> {
    const where: any = {};
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.leaveType) {
      where.leaveType = filters.leaveType;
    }
    if (filters.startDate || filters.endDate) {
      where[Op.or] = [
        {
          startDate: {
            [Op.between]: [filters.startDate || new Date(0), filters.endDate || new Date()],
          },
        },
        {
          endDate: {
            [Op.between]: [filters.startDate || new Date(0), filters.endDate || new Date()],
          },
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: filters.startDate || new Date() } },
            { endDate: { [Op.gte]: filters.endDate || new Date() } },
          ],
        },
      ];
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await LeaveRequest.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
        },
        {
          model: Employee,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'userCompEmail', 'employeeId'],
          required: false,
        },
      ],
      order: [['startDate', 'DESC']],
      limit,
      offset,
    });

    return { rows, count };
  }
}

