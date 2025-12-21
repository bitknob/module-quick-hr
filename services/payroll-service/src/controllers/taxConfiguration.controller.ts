import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { TaxConfigurationService } from '../services/taxConfiguration.service';
import { resolveCompanyId, checkCompanyAccess } from '../utils/companyIdResolver';
import { z } from 'zod';

const createTaxConfigurationSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  country: z.string().min(2, 'Country code is required (e.g., IN, US, UK)'),
  state: z.string().min(1, 'State/Province is required'),
  province: z.string().optional(),
  financialYear: z.string().min(1, 'Financial year is required'),
  incomeTaxEnabled: z.boolean().optional(),
  incomeTaxSlabs: z.any().optional(),
  socialSecurityEnabled: z.boolean().optional(),
  socialSecurityEmployerRate: z.number().min(0).max(100).optional(),
  socialSecurityEmployeeRate: z.number().min(0).max(100).optional(),
  socialSecurityMaxSalary: z.number().min(0).optional(),
  healthInsuranceEnabled: z.boolean().optional(),
  healthInsuranceEmployerRate: z.number().min(0).max(100).optional(),
  healthInsuranceEmployeeRate: z.number().min(0).max(100).optional(),
  healthInsuranceMaxSalary: z.number().min(0).optional(),
  localTaxEnabled: z.boolean().optional(),
  localTaxSlabs: z.any().optional(),
  professionalTaxEnabled: z.boolean().optional(),
  professionalTaxSlabs: z.any().optional(),
  housingAllowanceExemptionRules: z.any().optional(),
  travelAllowanceExemptionRules: z.any().optional(),
  standardDeduction: z.number().min(0).optional(),
  taxExemptions: z.any().optional(),
});

const updateTaxConfigurationSchema = createTaxConfigurationSchema.partial();

export const createTaxConfiguration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create tax configuration'));
    }

    const validatedData = createTaxConfigurationSchema.parse(req.body);
    const config = await TaxConfigurationService.createTaxConfiguration(validatedData);
    const configData = config.toJSON ? config.toJSON() : config;

    ResponseFormatter.success(res, configData, 'Tax configuration created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getTaxConfiguration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const config = await TaxConfigurationService.getTaxConfigurationById(id);
    const configData = config.toJSON ? config.toJSON() : config;

    ResponseFormatter.success(res, configData, 'Tax configuration retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTaxConfigurationByCompanyAndYear = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId, country, financialYear } = req.params;
    const config = await TaxConfigurationService.getTaxConfigurationByCompanyCountryAndYear(
      companyId,
      country,
      financialYear
    );

    if (!config) {
      return ResponseFormatter.error(res, 'Tax configuration not found', '', 404);
    }

    const configData = config.toJSON ? config.toJSON() : config;
    ResponseFormatter.success(res, configData, 'Tax configuration retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTaxConfiguration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to update tax configuration'));
    }

    const validatedData = updateTaxConfigurationSchema.parse(req.body);
    const config = await TaxConfigurationService.updateTaxConfiguration(id, validatedData);
    const configData = config.toJSON ? config.toJSON() : config;

    ResponseFormatter.success(res, configData, 'Tax configuration updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getTaxConfigurationsByCompany = async (
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
      ResponseFormatter.success(res, [], 'Tax configurations retrieved successfully');
      return;
    }
    
    const configs = await TaxConfigurationService.getTaxConfigurationsByCompany(resolvedCompanyId);
    const configsData = configs.map((c) => (c.toJSON ? c.toJSON() : c));

    ResponseFormatter.success(res, configsData, 'Tax configurations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

