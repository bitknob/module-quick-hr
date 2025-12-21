import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole, AccessControl } from '@hrm/common';
import { PayslipScheduleService } from '../services/payslipSchedule.service';
import { resolveCompanyId, checkCompanyAccess } from '../utils/companyIdResolver';
import { z } from 'zod';

const createScheduleSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  scheduleName: z.string().min(1, 'Schedule name is required'),
  description: z.string().optional(),
  frequency: z.enum(['monthly', 'biweekly', 'weekly', 'custom']),
  generationDay: z.number().int().min(1),
  generationTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  timezone: z.string().optional(),
  triggerType: z.enum(['automatic', 'manual', 'scheduled']).optional(),
  autoApprove: z.boolean().optional(),
  autoSend: z.boolean().optional(),
  emailConfiguration: z.any().optional(),
  notificationConfiguration: z.any().optional(),
  customScheduleRule: z.any().optional(),
  enabledMonths: z.array(z.number().int().min(1).max(12)).optional(),
  enabledYears: z.array(z.number().int()).optional(),
  excludedDates: z.array(z.string().datetime()).optional(),
  createdBy: z.string().optional(),
});

const updateScheduleSchema = createScheduleSchema.partial();

export const createSchedule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create schedule'));
    }

    const validatedData = createScheduleSchema.parse(req.body);
    const schedule = await PayslipScheduleService.createSchedule({
      ...validatedData,
      excludedDates: validatedData.excludedDates?.map((d) => new Date(d)),
      createdBy: req.user!.uid,
    });

    const scheduleData = schedule.toJSON ? schedule.toJSON() : schedule;
    ResponseFormatter.success(res, scheduleData, 'Schedule created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getSchedule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== 'string') {
      return next(new ValidationError('Company ID is required'));
    }

    const schedule = await PayslipScheduleService.getScheduleById(id, companyId);
    const scheduleData = schedule.toJSON ? schedule.toJSON() : schedule;

    ResponseFormatter.success(res, scheduleData, 'Schedule retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getSchedulesByCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    const resolvedCompanyId = await resolveCompanyId(req.params.companyId, req.user?.uid, userRole);
    await checkCompanyAccess(resolvedCompanyId, req.user?.uid, userRole);
    
    // If resolvedCompanyId is null, it means placeholder was sent for a user who can access all companies
    // Return empty array in this case
    if (resolvedCompanyId === null) {
      ResponseFormatter.success(res, [], 'Schedules retrieved successfully');
      return;
    }
    
    const status = req.query.status as string | undefined;

    const schedules = await PayslipScheduleService.getSchedulesByCompany(resolvedCompanyId, status);
    const schedulesData = schedules.map((s) => (s.toJSON ? s.toJSON() : s));

    ResponseFormatter.success(res, schedulesData, 'Schedules retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.body;
    const userRole = req.user?.role as UserRole;

    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to update schedule'));
    }

    const validatedData = updateScheduleSchema.parse(req.body);
    const schedule = await PayslipScheduleService.updateSchedule(id, companyId, {
      ...validatedData,
      excludedDates: validatedData.excludedDates?.map((d) => new Date(d)),
    });

    const scheduleData = schedule.toJSON ? schedule.toJSON() : schedule;
    ResponseFormatter.success(res, scheduleData, 'Schedule updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getGenerationLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    const resolvedCompanyId = await resolveCompanyId(req.params.companyId, req.user?.uid, userRole);
    await checkCompanyAccess(resolvedCompanyId, req.user?.uid, userRole);
    
    // If resolvedCompanyId is null, it means placeholder was sent for a user who can access all companies
    // Return empty result in this case
    if (resolvedCompanyId === null) {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      ResponseFormatter.success(
        res,
        {
          logs: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
        'Generation logs retrieved successfully'
      );
      return;
    }
    
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await PayslipScheduleService.getGenerationLogsByCompany(resolvedCompanyId, page, limit);
    const logsData = result.rows.map((log) => (log.toJSON ? log.toJSON() : log));

    ResponseFormatter.success(
      res,
      {
        logs: logsData,
        pagination: {
          page,
          limit,
          total: result.count,
          totalPages: Math.ceil(result.count / limit),
        },
      },
      'Generation logs retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

