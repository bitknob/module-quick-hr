import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { VariablePayService } from '../services/variablePay.service';
import { z } from 'zod';

const createVariablePaySchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  variablePayType: z.enum(['bonus', 'incentive', 'commission', 'overtime', 'shift_allowance', 'performance_bonus', 'retention_bonus', 'other']),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  calculationBasis: z.string().optional(),
  calculationDetails: z.any().optional(),
  applicableMonth: z.number().int().min(1).max(12),
  applicableYear: z.number().int().min(2000).max(3000),
  isTaxable: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.any().optional(),
});

const updateVariablePaySchema = createVariablePaySchema.partial();

export const createVariablePay = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create variable pay'));
    }

    const validatedData = createVariablePaySchema.parse(req.body);
    const variablePay = await VariablePayService.createVariablePay(validatedData);
    const variablePayData = variablePay.toJSON ? variablePay.toJSON() : variablePay;

    ResponseFormatter.success(res, variablePayData, 'Variable pay created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getVariablePay = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const variablePay = await VariablePayService.getVariablePayById(id);
    const variablePayData = variablePay.toJSON ? variablePay.toJSON() : variablePay;

    ResponseFormatter.success(res, variablePayData, 'Variable pay retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateVariablePay = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateVariablePaySchema.parse(req.body);
    const variablePay = await VariablePayService.updateVariablePay(id, validatedData);
    const variablePayData = variablePay.toJSON ? variablePay.toJSON() : variablePay;

    ResponseFormatter.success(res, variablePayData, 'Variable pay updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const approveVariablePay = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to approve variable pay'));
    }

    const variablePay = await VariablePayService.approveVariablePay(id, req.user!.uid);
    const variablePayData = variablePay.toJSON ? variablePay.toJSON() : variablePay;

    ResponseFormatter.success(res, variablePayData, 'Variable pay approved successfully');
  } catch (error) {
    next(error);
  }
};

export const getVariablePayByEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const status = req.query.status as string | undefined;

    const variablePays = await VariablePayService.getVariablePayByEmployee(employeeId, month, year, status);
    const variablePaysData = variablePays.map((vp) => (vp.toJSON ? vp.toJSON() : vp));

    ResponseFormatter.success(res, variablePaysData, 'Variable pays retrieved successfully');
  } catch (error) {
    next(error);
  }
};

