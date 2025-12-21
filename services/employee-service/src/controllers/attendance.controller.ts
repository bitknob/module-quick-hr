import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { AttendanceService } from '../services/attendance.service';
import { z } from 'zod';
import { AttendanceStatus } from '@hrm/common';

const createAttendanceSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  date: z.string().or(z.date()).transform((val) => (typeof val === 'string' ? new Date(val) : val)),
  checkIn: z.string().or(z.date()).optional().transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  checkOut: z.string().or(z.date()).optional().transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  status: z.nativeEnum(AttendanceStatus).optional(),
  notes: z.string().optional(),
});

const updateAttendanceSchema = z.object({
  checkIn: z.string().or(z.date()).optional().transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  checkOut: z.string().or(z.date()).optional().transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  status: z.nativeEnum(AttendanceStatus).optional(),
  notes: z.string().optional(),
});

export const createAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN, UserRole.MANAGER].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create attendance'));
    }

    const validatedData = createAttendanceSchema.parse(req.body);
    const attendance = await AttendanceService.createAttendance(validatedData);
    const attendanceData = attendance.toJSON ? attendance.toJSON() : attendance;

    ResponseFormatter.success(res, attendanceData, 'Attendance created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const attendance = await AttendanceService.getAttendanceById(id, companyId);
    const attendanceData = attendance.toJSON ? attendance.toJSON() : attendance;

    ResponseFormatter.success(res, attendanceData, 'Attendance retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN, UserRole.MANAGER].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to update attendance'));
    }

    const validatedData = updateAttendanceSchema.parse(req.body);
    const attendance = await AttendanceService.updateAttendance(id, validatedData, companyId);
    const attendanceData = attendance.toJSON ? attendance.toJSON() : attendance;

    ResponseFormatter.success(res, attendanceData, 'Attendance updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const deleteAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to delete attendance'));
    }

    await AttendanceService.deleteAttendance(id, companyId);
    ResponseFormatter.success(res, null, 'Attendance deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getAttendanceByEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const companyId = req.query.companyId as string | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const attendances = await AttendanceService.getAttendanceByEmployee(
      employeeId,
      companyId,
      startDate,
      endDate
    );
    const attendancesData = attendances.map((a) => (a.toJSON ? a.toJSON() : a));

    ResponseFormatter.success(res, attendancesData, 'Attendances retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAttendanceByCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const status = req.query.status as AttendanceStatus | undefined;

    const attendances = await AttendanceService.getAttendanceByCompany(
      companyId,
      startDate,
      endDate,
      status
    );
    const attendancesData = attendances.map((a) => (a.toJSON ? a.toJSON() : a));

    ResponseFormatter.success(res, attendancesData, 'Attendances retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAttendanceStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId, companyId } = req.params;
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    if (!month || !year) {
      return next(new ValidationError('Month and year are required'));
    }

    const stats = await AttendanceService.getAttendanceStats(employeeId, companyId, month, year);
    ResponseFormatter.success(res, stats, 'Attendance stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId, companyId } = req.params;
    const checkInTime = req.body.checkInTime ? new Date(req.body.checkInTime) : undefined;

    const attendance = await AttendanceService.checkIn(employeeId, companyId, checkInTime);
    const attendanceData = attendance.toJSON ? attendance.toJSON() : attendance;

    ResponseFormatter.success(res, attendanceData, 'Checked in successfully', '', 201);
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId, companyId } = req.params;
    const checkOutTime = req.body.checkOutTime ? new Date(req.body.checkOutTime) : undefined;

    const attendance = await AttendanceService.checkOut(employeeId, companyId, checkOutTime);
    const attendanceData = attendance.toJSON ? attendance.toJSON() : attendance;

    ResponseFormatter.success(res, attendanceData, 'Checked out successfully');
  } catch (error) {
    next(error);
  }
};

export const searchAttendances = async (
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
      status: req.query.status as AttendanceStatus | undefined,
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await AttendanceService.searchAttendances(filters, page, limit);
    const attendancesData = result.rows.map((a) => (a.toJSON ? a.toJSON() : a));

    ResponseFormatter.paginated(
      res,
      attendancesData,
      result.count,
      page,
      limit,
      'Attendances retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

