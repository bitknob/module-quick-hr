import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { Attendance } from '../models/Attendance.model';
import { Employee } from '../models/Employee.model';
import { AttendanceStatus } from '@hrm/common';

export class AttendanceQueries {
  static async findById(id: string, companyId?: string): Promise<Attendance | null> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    return await Attendance.findOne({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
      ],
    });
  }

  static async findByEmployeeAndDate(
    employeeId: string,
    date: Date,
    companyId?: string
  ): Promise<Attendance | null> {
    const where: any = {
      employeeId,
      date,
    };
    if (companyId) {
      where.companyId = companyId;
    }

    return await Attendance.findOne({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
      ],
    });
  }

  static async findByEmployee(
    employeeId: string,
    companyId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Attendance[]> {
    const where: any = { employeeId };
    if (companyId) {
      where.companyId = companyId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date[Op.gte] = startDate;
      }
      if (endDate) {
        where.date[Op.lte] = endDate;
      }
    }

    return await Attendance.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
      ],
      order: [['date', 'DESC']],
    });
  }

  static async findByCompany(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    status?: AttendanceStatus
  ): Promise<Attendance[]> {
    const where: any = { companyId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date[Op.gte] = startDate;
      }
      if (endDate) {
        where.date[Op.lte] = endDate;
      }
    }
    if (status) {
      where.status = status;
    }

    return await Attendance.findAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
      ],
      order: [['date', 'DESC']],
    });
  }

  static async getAttendanceStats(
    employeeId: string,
    companyId: string,
    month: number,
    year: number
  ): Promise<{
    workingDays: number;
    presentDays: number;
    absentDays: number;
    leaveDays: number;
    lateDays: number;
    halfDayDays: number;
  }> {
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
    let lateDays = 0;
    let halfDayDays = 0;

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
        if (attendance.status === 'present') {
          presentDays++;
        } else if (attendance.status === 'late') {
          presentDays++;
          lateDays++;
        } else if (attendance.status === 'half_day') {
          presentDays++;
          halfDayDays++;
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
      lateDays,
      halfDayDays,
    };
  }

  static async searchAttendances(
    filters: {
      companyId?: string;
      employeeId?: string;
      startDate?: Date;
      endDate?: Date;
      status?: AttendanceStatus;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{ rows: Attendance[]; count: number }> {
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
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        where.date[Op.lte] = filters.endDate;
      }
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Attendance.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId'],
        },
      ],
      order: [['date', 'DESC']],
      limit,
      offset,
    });

    return { rows, count };
  }
}

