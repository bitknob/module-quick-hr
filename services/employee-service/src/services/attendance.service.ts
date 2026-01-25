import { Attendance } from '../models/Attendance.model';
import { AttendanceQueries } from '../queries/attendance.queries';
import { EmployeeQueries } from '../queries/employee.queries';
import { ConflictError, NotFoundError, ValidationError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { AttendanceStatus } from '@hrm/common';

export class AttendanceService {
  static async createAttendance(data: {
    employeeId: string;
    companyId: string;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status?: AttendanceStatus;
    notes?: string;
  }): Promise<Attendance> {
    const employee = await EmployeeQueries.findById(data.employeeId, data.companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    if (employee.companyId !== data.companyId) {
      throw new ValidationError('Employee does not belong to the specified company');
    }

    const existing = await AttendanceQueries.findByEmployeeAndDate(
      data.employeeId,
      data.date,
      data.companyId
    );
    if (existing) {
      throw new ConflictError('Attendance record already exists for this date');
    }

    if (data.checkOut && data.checkIn) {
      if (new Date(data.checkOut) < new Date(data.checkIn)) {
        throw new ValidationError('Check-out time cannot be before check-in time');
      }
    }

    return await Attendance.create({
      id: uuidv4(),
      employeeId: data.employeeId,
      companyId: data.companyId,
      date: data.date,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      status: data.status || AttendanceStatus.PRESENT,
      notes: data.notes,
    });
  }

  static async getAttendanceById(id: string, companyId?: string): Promise<Attendance> {
    const attendance = await AttendanceQueries.findById(id, companyId);
    if (!attendance) {
      throw new NotFoundError('Attendance record');
    }
    return attendance;
  }

  static async updateAttendance(
    id: string,
    data: Partial<{
      checkIn: Date;
      checkOut: Date;
      status: AttendanceStatus;
      notes: string;
    }>,
    companyId?: string
  ): Promise<Attendance> {
    const attendance = await AttendanceQueries.findById(id, companyId);
    if (!attendance) {
      throw new NotFoundError('Attendance record');
    }

    if (data.checkOut && data.checkIn) {
      const checkIn = data.checkIn || attendance.checkIn;
      const checkOut = data.checkOut || attendance.checkOut;
      if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) {
        throw new ValidationError('Check-out time cannot be before check-in time');
      }
    }

    await Attendance.update(data as any, { where: { id } });
    return await AttendanceQueries.findById(id, companyId) as Attendance;
  }

  static async deleteAttendance(id: string, companyId?: string): Promise<void> {
    const attendance = await AttendanceQueries.findById(id, companyId);
    if (!attendance) {
      throw new NotFoundError('Attendance record');
    }

    await Attendance.destroy({ where: { id } });
  }

  static async getAttendanceByEmployee(
    employeeId: string,
    companyId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Attendance[]> {
    const employee = await EmployeeQueries.findById(employeeId, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    return await AttendanceQueries.findByEmployee(employeeId, companyId, startDate, endDate);
  }

  static async getAttendanceByCompany(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    status?: AttendanceStatus
  ): Promise<Attendance[]> {
    return await AttendanceQueries.findByCompany(companyId, startDate, endDate, status);
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
    if (month < 1 || month > 12) {
      throw new ValidationError('Invalid month');
    }

    const employee = await EmployeeQueries.findById(employeeId, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    return await AttendanceQueries.getAttendanceStats(employeeId, companyId, month, year);
  }

  static async checkIn(
    employeeId: string,
    companyId: string,
    checkInTime?: Date
  ): Promise<Attendance> {
    const employee = await EmployeeQueries.findById(employeeId, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = checkInTime || new Date();

    const existing = await AttendanceQueries.findByEmployeeAndDate(
      employeeId,
      today,
      companyId
    );

    if (existing) {
      if (existing.checkIn) {
        throw new ConflictError('Already checked in today');
      }
      await Attendance.update(
        { checkIn: checkIn },
        { where: { id: existing.id } }
      );
      return await AttendanceQueries.findById(existing.id, companyId) as Attendance;
    }

    return await this.createAttendance({
      employeeId,
      companyId,
      date: today,
      checkIn: checkIn,
      status: AttendanceStatus.PRESENT,
    });
  }

  static async checkOut(
    employeeId: string,
    companyId: string,
    checkOutTime?: Date
  ): Promise<Attendance> {
    const employee = await EmployeeQueries.findById(employeeId, companyId);
    if (!employee) {
      throw new NotFoundError('Employee');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOut = checkOutTime || new Date();

    const attendance = await AttendanceQueries.findByEmployeeAndDate(
      employeeId,
      today,
      companyId
    );

    if (!attendance) {
      throw new NotFoundError('No check-in record found for today');
    }

    console.log('Attendance object:', attendance);
    console.log('Attendance ID:', attendance.get('id'));

    if (attendance.checkOut) {
      throw new ConflictError('Already checked out today');
    }

    if (attendance.checkIn && new Date(checkOut) < new Date(attendance.checkIn)) {
      throw new ValidationError('Check-out time cannot be before check-in time');
    }

    const attendanceId = attendance.get('id') as string;
    if (!attendanceId) {
      throw new Error('Attendance record is missing ID');
    }

    await Attendance.update(
      { checkOut: checkOut },
      { where: { id: attendanceId } }
    );

    return await AttendanceQueries.findById(attendanceId, companyId) as Attendance;
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
  ) {
    return await AttendanceQueries.searchAttendances(filters, page, limit);
  }
}

