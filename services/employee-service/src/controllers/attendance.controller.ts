import { Response, NextFunction } from 'express';
import {
  AuthRequest,
  ResponseFormatter,
  ValidationError,
  UserRole,
  NotFoundError,
} from '@hrm/common';
import { AttendanceService } from '../services/attendance.service';
import { EmployeeQueries } from '../queries/employee.queries';
import { z } from 'zod';
import { AttendanceStatus } from '@hrm/common';

const createAttendanceSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  date: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
  checkIn: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  checkOut: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  status: z.nativeEnum(AttendanceStatus).optional(),
  notes: z.string().optional(),
});

const updateAttendanceSchema = z.object({
  checkIn: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
  checkOut: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? (typeof val === 'string' ? new Date(val) : val) : undefined)),
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
    if (
      ![
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
        UserRole.MANAGER,
      ].includes(userRole)
    ) {
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

    // Validate required parameters - handle 'undefined' string
    if (!id || id === 'undefined') {
      return next(new ValidationError('Attendance ID is required'));
    }

    // Handle optional companyId - convert 'undefined' string to undefined
    let companyId = req.query.companyId as string | undefined;
    if (companyId === 'undefined') {
      companyId = undefined;
    }

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

    // Validate required parameters - handle 'undefined' string
    if (!id || id === 'undefined') {
      return next(new ValidationError('Attendance ID is required'));
    }

    // Handle optional companyId - convert 'undefined' string to undefined
    let companyId = req.query.companyId as string | undefined;
    if (companyId === 'undefined') {
      companyId = undefined;
    }
    const userRole = req.user?.role as UserRole;
    if (
      ![
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
        UserRole.MANAGER,
      ].includes(userRole)
    ) {
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

    // Validate required parameters - handle 'undefined' string
    if (!id || id === 'undefined') {
      return next(new ValidationError('Attendance ID is required'));
    }

    // Handle optional companyId - convert 'undefined' string to undefined
    let companyId = req.query.companyId as string | undefined;
    if (companyId === 'undefined') {
      companyId = undefined;
    }
    const userRole = req.user?.role as UserRole;
    if (
      ![
        UserRole.SUPER_ADMIN,
        UserRole.PROVIDER_ADMIN,
        UserRole.PROVIDER_HR_STAFF,
        UserRole.HRBP,
        UserRole.COMPANY_ADMIN,
      ].includes(userRole)
    ) {
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

    // Validate required parameters - handle 'undefined' string
    if (!employeeId || employeeId === 'undefined') {
      return next(new ValidationError('Employee ID is required'));
    }

    // Handle optional companyId - convert 'undefined' string to undefined
    let companyId = req.query.companyId as string | undefined;
    if (companyId === 'undefined') {
      companyId = undefined;
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    // Check if the employeeId parameter is actually a userEmail
    // First try to find by employee ID, then by userEmail
    let actualEmployeeId = employeeId;
    let employee = await EmployeeQueries.findById(employeeId, companyId);

    if (!employee) {
      // Try to find by userEmail (check if it's an email format)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(employeeId)) {
        employee = await EmployeeQueries.findByAnyEmail(employeeId);
        if (employee) {
          actualEmployeeId = employee.id;
        }
      }

      // If still not found, check if this is the current user requesting their own data
      // by using their user email to find the employee record
      if (!employee && req.user?.email) {
        employee = await EmployeeQueries.findByAnyEmail(req.user.email);
        if (employee) {
          actualEmployeeId = employee.id;
        }
      }

      if (!employee) {
        // Employee not found - check if it's the current user requesting their own data
        // Users without employee records don't have attendance, so return empty array
        const currentUserEmail = req.user?.email;
        if (currentUserEmail && currentUserEmail === employeeId) {
          ResponseFormatter.success(
            res,
            [],
            'Attendances retrieved successfully (no employee record)'
          );
          return;
        }
        // For other users, return 404
        throw new NotFoundError('Employee');
      }
    }

    // Only call service if we found an employee
    const attendances = await AttendanceService.getAttendanceByEmployee(
      actualEmployeeId,
      companyId,
      startDate,
      endDate
    );
    const attendancesData = attendances.map((a) => (a.toJSON ? a.toJSON() : a));

    ResponseFormatter.success(res, attendancesData, 'Attendances retrieved successfully');
  } catch (error: any) {
    // Handle NotFoundError - if user is requesting their own data, return empty array
    if (error instanceof NotFoundError && error.message?.includes('Employee')) {
      const { employeeId } = req.params;
      const currentUserEmail = req.user?.email;
      if (currentUserEmail && currentUserEmail === employeeId) {
        // User is requesting their own data but has no employee record
        ResponseFormatter.success(
          res,
          [],
          'Attendances retrieved successfully (no employee record)'
        );
        return;
      }
    }
    // For other errors, pass to error handler
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

    // Validate required parameters - handle 'undefined' string
    if (!companyId || companyId === 'undefined') {
      return next(new ValidationError('Company ID is required'));
    }

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

    // Validate required parameters - handle 'undefined' string
    if (!employeeId || employeeId === 'undefined') {
      return next(new ValidationError('Employee ID is required'));
    }
    if (!companyId || companyId === 'undefined') {
      return next(new ValidationError('Company ID is required'));
    }

    // Validate month and year
    if (!month || !year || isNaN(month) || isNaN(year)) {
      return next(new ValidationError('Month and year are required'));
    }

    // At this point, employeeId and companyId are guaranteed to be strings (not undefined)
    const stats = await AttendanceService.getAttendanceStats(
      employeeId as string,
      companyId as string,
      month,
      year
    );
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

    // Validate required parameters - handle 'undefined' string
    if (!employeeId || employeeId === 'undefined') {
      return next(new ValidationError('Employee ID is required'));
    }

    // Handle optional companyId - if not provided, try to find from employee context
    let actualCompanyId = companyId;
    if (!actualCompanyId || actualCompanyId === 'undefined') {
      // Try to find employee and get their company ID
      let employee = await EmployeeQueries.findById(employeeId);
      
      if (!employee) {
        // Try to find by user email (current user)
        if (req.user?.email) {
          employee = await EmployeeQueries.findByAnyEmail(req.user.email);
        }
      }
      
      if (employee) {
        actualCompanyId = employee.companyId;
      } else {
        return next(new ValidationError('Company ID is required and could not be determined'));
      }
    }

    const checkInTime = req.body.checkInTime ? new Date(req.body.checkInTime) : undefined;

    // Find the actual employee ID if we used user email to find employee
    let actualEmployeeId = employeeId;
    let employee = await EmployeeQueries.findById(employeeId);
    
    if (!employee && req.user?.email) {
      employee = await EmployeeQueries.findByAnyEmail(req.user.email);
      if (employee) {
        actualEmployeeId = employee.id;
      }
    }

    const attendance = await AttendanceService.checkIn(
      actualEmployeeId,
      actualCompanyId,
      checkInTime
    );
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

    // Validate required parameters - handle 'undefined' string
    if (!employeeId || employeeId === 'undefined') {
      return next(new ValidationError('Employee ID is required'));
    }
    if (!companyId || companyId === 'undefined') {
      return next(new ValidationError('Company ID is required'));
    }

    const checkOutTime = req.body.checkOutTime ? new Date(req.body.checkOutTime) : undefined;

    // At this point, employeeId and companyId are guaranteed to be strings (not undefined)
    const attendance = await AttendanceService.checkOut(
      employeeId as string,
      companyId as string,
      checkOutTime
    );
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
