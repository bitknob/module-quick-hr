import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { ReimbursementService } from '../services/reimbursement.service';
import { z } from 'zod';

const createReimbursementSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  reimbursementType: z.enum(['travel', 'medical', 'meal', 'telephone', 'internet', 'fuel', 'conveyance', 'other']),
  description: z.string().optional(),
  claimAmount: z.number().min(0, 'Claim amount must be positive'),
  claimDate: z.string().datetime(),
  documents: z.array(z.string()).optional(),
  expenseBreakdown: z.any().optional(),
  applicableMonth: z.number().int().min(1).max(12),
  applicableYear: z.number().int().min(2000).max(3000),
  isTaxable: z.boolean().optional(),
  taxExemptionLimit: z.number().optional(),
});

const approveReimbursementSchema = z.object({
  approvedAmount: z.number().min(0, 'Approved amount must be positive'),
});

const rejectReimbursementSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export const createReimbursement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createReimbursementSchema.parse(req.body);
    const reimbursement = await ReimbursementService.createReimbursement({
      ...validatedData,
      claimDate: new Date(validatedData.claimDate),
    });
    const reimbursementData = reimbursement.toJSON ? reimbursement.toJSON() : reimbursement;

    ResponseFormatter.success(res, reimbursementData, 'Reimbursement created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getReimbursement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const reimbursement = await ReimbursementService.getReimbursementById(id);
    const reimbursementData = reimbursement.toJSON ? reimbursement.toJSON() : reimbursement;

    ResponseFormatter.success(res, reimbursementData, 'Reimbursement retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const submitReimbursement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const reimbursement = await ReimbursementService.submitReimbursement(id);
    const reimbursementData = reimbursement.toJSON ? reimbursement.toJSON() : reimbursement;

    ResponseFormatter.success(res, reimbursementData, 'Reimbursement submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const approveReimbursement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.MANAGER].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to approve reimbursement'));
    }

    const validatedData = approveReimbursementSchema.parse(req.body);
    const reimbursement = await ReimbursementService.approveReimbursement(
      id,
      validatedData.approvedAmount,
      req.user!.uid
    );
    const reimbursementData = reimbursement.toJSON ? reimbursement.toJSON() : reimbursement;

    ResponseFormatter.success(res, reimbursementData, 'Reimbursement approved successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const rejectReimbursement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.MANAGER].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to reject reimbursement'));
    }

    const validatedData = rejectReimbursementSchema.parse(req.body);
    const reimbursement = await ReimbursementService.rejectReimbursement(id, validatedData.rejectionReason);
    const reimbursementData = reimbursement.toJSON ? reimbursement.toJSON() : reimbursement;

    ResponseFormatter.success(res, reimbursementData, 'Reimbursement rejected successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getReimbursementsByEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const status = req.query.status as string | undefined;
    const reimbursementType = req.query.type as string | undefined;

    const reimbursements = await ReimbursementService.getReimbursementsByEmployee(
      employeeId,
      month,
      year,
      status,
      reimbursementType
    );
    const reimbursementsData = reimbursements.map((r) => (r.toJSON ? r.toJSON() : r));

    ResponseFormatter.success(res, reimbursementsData, 'Reimbursements retrieved successfully');
  } catch (error) {
    next(error);
  }
};

