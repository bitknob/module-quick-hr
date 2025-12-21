import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, AccessControl, UserRole } from '@hrm/common';
import { SalaryStructureService } from '../services/salaryStructure.service';
import { ComponentCategory } from '../models/PayrollComponent.model';
import { resolveCompanyId, checkCompanyAccess } from '../utils/companyIdResolver';
import { z } from 'zod';

const createSalaryStructureSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  components: z
    .array(
      z.object({
        componentName: z.string().min(1, 'Component name is required'),
        componentType: z.enum(['earning', 'deduction']),
        componentCategory: z.enum([
          'basic',
          'hra',
          'lta',
          'special_allowance',
          'transport_allowance',
          'medical_allowance',
          'bonus',
          'overtime',
          'incentive',
          'tds',
          'professional_tax',
          'epf',
          'esi',
          'loan',
          'advance',
          'other',
        ]) as z.ZodType<ComponentCategory>,
        isPercentage: z.boolean(),
        value: z.number().min(0, 'Value must be positive'),
        percentageOf: z.string().optional(),
        isTaxable: z.boolean(),
        isStatutory: z.boolean(),
        priority: z.number().int().min(0),
      })
    )
    .optional(),
});

const updateSalaryStructureSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const addComponentSchema = z.object({
  componentName: z.string().min(1, 'Component name is required'),
  componentType: z.enum(['earning', 'deduction']),
  componentCategory: z.enum([
    'basic',
    'hra',
    'lta',
    'special_allowance',
    'transport_allowance',
    'medical_allowance',
    'bonus',
    'overtime',
    'incentive',
    'tds',
    'professional_tax',
    'epf',
    'esi',
    'loan',
    'advance',
    'other',
  ]) as z.ZodType<ComponentCategory>,
  isPercentage: z.boolean(),
  value: z.number().min(0, 'Value must be positive'),
  percentageOf: z.string().optional(),
  isTaxable: z.boolean(),
  isStatutory: z.boolean(),
  priority: z.number().int().min(0),
});

const assignSalaryStructureSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  companyId: z.string().uuid('Invalid company ID'),
  salaryStructureId: z.string().uuid('Invalid salary structure ID'),
  ctc: z.number().min(0, 'CTC must be positive'),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
});

export const createSalaryStructure = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create salary structure'));
    }

    const validatedData = createSalaryStructureSchema.parse(req.body);
    const structure = await SalaryStructureService.createSalaryStructure(validatedData);
    const structureData = structure.toJSON ? structure.toJSON() : structure;

    ResponseFormatter.success(res, structureData, 'Salary structure created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getSalaryStructure = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const structure = await SalaryStructureService.getSalaryStructureById(id);
    const structureData = structure.toJSON ? structure.toJSON() : structure;

    ResponseFormatter.success(res, structureData, 'Salary structure retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSalaryStructure = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateSalaryStructureSchema.parse(req.body);
    const structure = await SalaryStructureService.updateSalaryStructure(id, validatedData);
    const structureData = structure.toJSON ? structure.toJSON() : structure;

    ResponseFormatter.success(res, structureData, 'Salary structure updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getSalaryStructuresByCompany = async (
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
      ResponseFormatter.success(res, [], 'Salary structures retrieved successfully');
      return;
    }
    
    const structures = await SalaryStructureService.getSalaryStructuresByCompany(resolvedCompanyId);
    const structuresData = structures.map((s) => (s.toJSON ? s.toJSON() : s));

    ResponseFormatter.success(res, structuresData, 'Salary structures retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const addComponent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = addComponentSchema.parse(req.body);
    const component = await SalaryStructureService.addComponent(id, validatedData);
    const componentData = component.toJSON ? component.toJSON() : component;

    ResponseFormatter.success(res, componentData, 'Component added successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const updateComponent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateSchema = z.object({
      componentName: z.string().min(1).optional(),
      componentType: z.enum(['earning', 'deduction']).optional(),
      componentCategory: z.enum([
        'basic',
        'hra',
        'lta',
        'special_allowance',
        'transport_allowance',
        'medical_allowance',
        'bonus',
        'overtime',
        'incentive',
        'tds',
        'professional_tax',
        'epf',
        'esi',
        'loan',
        'advance',
        'other',
      ]).optional() as z.ZodType<ComponentCategory | undefined>,
      isPercentage: z.boolean().optional(),
      value: z.number().min(0).optional(),
      percentageOf: z.string().optional(),
      isTaxable: z.boolean().optional(),
      isStatutory: z.boolean().optional(),
      priority: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    });
    const validatedData = updateSchema.parse(req.body);
    const component = await SalaryStructureService.updateComponent(id, validatedData as any);
    const componentData = component.toJSON ? component.toJSON() : component;

    ResponseFormatter.success(res, componentData, 'Component updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const deleteComponent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await SalaryStructureService.deleteComponent(id);
    ResponseFormatter.success(res, null, 'Component deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const assignSalaryStructure = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = assignSalaryStructureSchema.parse(req.body);
    const employeeStructure = await SalaryStructureService.assignSalaryStructureToEmployee({
      ...validatedData,
      effectiveFrom: new Date(validatedData.effectiveFrom),
      effectiveTo: validatedData.effectiveTo ? new Date(validatedData.effectiveTo) : undefined,
    });
    const structureData = employeeStructure.toJSON ? employeeStructure.toJSON() : employeeStructure;

    ResponseFormatter.success(res, structureData, 'Salary structure assigned successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getEmployeeSalaryStructure = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const structure = await SalaryStructureService.getEmployeeSalaryStructure(employeeId);

    if (!structure) {
      return ResponseFormatter.error(res, 'Salary structure not found for employee', '', 404);
    }

    const structureData = structure.toJSON ? structure.toJSON() : structure;
    ResponseFormatter.success(res, structureData, 'Employee salary structure retrieved successfully');
  } catch (error) {
    next(error);
  }
};

