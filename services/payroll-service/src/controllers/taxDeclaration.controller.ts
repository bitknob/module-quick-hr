import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { TaxDeclarationService } from '../services/taxDeclaration.service';
import { z } from 'zod';

const createTaxDeclarationSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  financialYear: z.string().min(1, 'Financial year is required'),
  declarations: z.any().default({}),
});

const verifyTaxDeclarationSchema = z.object({
  verifiedAmount: z.number().min(0, 'Verified amount must be positive'),
  notes: z.string().optional(),
});

export const createOrUpdateTaxDeclaration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = createTaxDeclarationSchema.parse(req.body);
    const declaration = await TaxDeclarationService.createOrUpdateTaxDeclaration({
      ...validatedData,
      declarations: validatedData.declarations || {},
    });
    const declarationData = declaration.toJSON ? declaration.toJSON() : declaration;

    ResponseFormatter.success(res, declarationData, 'Tax declaration saved successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const submitTaxDeclaration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const declaration = await TaxDeclarationService.submitTaxDeclaration(id);
    const declarationData = declaration.toJSON ? declaration.toJSON() : declaration;

    ResponseFormatter.success(res, declarationData, 'Tax declaration submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyTaxDeclaration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to verify tax declaration'));
    }

    const validatedData = verifyTaxDeclarationSchema.parse(req.body);
    const declaration = await TaxDeclarationService.verifyTaxDeclaration(
      id,
      validatedData.verifiedAmount,
      req.user!.uid,
      validatedData.notes
    );
    const declarationData = declaration.toJSON ? declaration.toJSON() : declaration;

    ResponseFormatter.success(res, declarationData, 'Tax declaration verified successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getTaxDeclaration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const declaration = await TaxDeclarationService.getTaxDeclarationById(id);
    const declarationData = declaration.toJSON ? declaration.toJSON() : declaration;

    ResponseFormatter.success(res, declarationData, 'Tax declaration retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTaxDeclarationByEmployeeAndYear = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId, financialYear } = req.params;
    const declaration = await TaxDeclarationService.getTaxDeclarationByEmployeeAndYear(
      employeeId,
      financialYear
    );

    if (!declaration) {
      return ResponseFormatter.error(res, 'Tax declaration not found', '', 404);
    }

    const declarationData = declaration.toJSON ? declaration.toJSON() : declaration;
    ResponseFormatter.success(res, declarationData, 'Tax declaration retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTaxDeclarationsByCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const financialYear = req.query.financialYear as string | undefined;
    const verificationStatus = req.query.verificationStatus as string | undefined;

    const declarations = await TaxDeclarationService.getTaxDeclarationsByCompany(
      companyId,
      financialYear,
      verificationStatus
    );
    const declarationsData = declarations.map((d) => (d.toJSON ? d.toJSON() : d));

    ResponseFormatter.success(res, declarationsData, 'Tax declarations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

