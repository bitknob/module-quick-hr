import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { ArrearsService } from '../services/arrears.service';
import { z } from 'zod';

const createArrearsSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  arrearsType: z.enum(['salary_revision', 'promotion', 'retroactive_adjustment', 'correction', 'bonus_arrears', 'allowance_adjustment', 'other']),
  description: z.string().optional(),
  originalPeriodFrom: z.string().datetime(),
  originalPeriodTo: z.string().datetime(),
  adjustmentAmount: z.number(),
  breakdown: z.any().optional(),
  reason: z.string().optional(),
  applicableMonth: z.number().int().min(1).max(12),
  applicableYear: z.number().int().min(2000).max(3000),
  isTaxable: z.boolean().optional(),
  taxCalculationBasis: z.string().optional(),
});

export const createArrears = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create arrears'));
    }

    const validatedData = createArrearsSchema.parse(req.body);
    const arrears = await ArrearsService.createArrears({
      ...validatedData,
      originalPeriodFrom: new Date(validatedData.originalPeriodFrom),
      originalPeriodTo: new Date(validatedData.originalPeriodTo),
    });
    const arrearsData = arrears.toJSON ? arrears.toJSON() : arrears;

    ResponseFormatter.success(res, arrearsData, 'Arrears created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getArrears = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const arrears = await ArrearsService.getArrearsById(id);
    const arrearsData = arrears.toJSON ? arrears.toJSON() : arrears;

    ResponseFormatter.success(res, arrearsData, 'Arrears retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const approveArrears = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to approve arrears'));
    }

    const arrears = await ArrearsService.approveArrears(id, req.user!.uid);
    const arrearsData = arrears.toJSON ? arrears.toJSON() : arrears;

    ResponseFormatter.success(res, arrearsData, 'Arrears approved successfully');
  } catch (error) {
    next(error);
  }
};

export const getArrearsByEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const status = req.query.status as string | undefined;

    const arrearsList = await ArrearsService.getArrearsByEmployee(employeeId, month, year, status);
    const arrearsData = arrearsList.map((a) => (a.toJSON ? a.toJSON() : a));

    ResponseFormatter.success(res, arrearsData, 'Arrears retrieved successfully');
  } catch (error) {
    next(error);
  }
};

