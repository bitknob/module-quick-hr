import { Response, NextFunction } from 'express';
import { AuthRequest, ResponseFormatter, ValidationError, UserRole, AccessControl } from '@hrm/common';
import { PayrollService } from '../services/payroll.service';
import { resolveCompanyId, checkCompanyAccess } from '../utils/companyIdResolver';
import { z } from 'zod';

const createPayrollRunSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  payrollMonth: z.number().int().min(1).max(12),
  payrollYear: z.number().int().min(2000).max(3000),
  processedBy: z.string().optional(),
});

const processPayrollRunSchema = z.object({
  processedBy: z.string().min(1, 'Processed by is required'),
});

export const createPayrollRun = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create payroll run'));
    }

    const validatedData = createPayrollRunSchema.parse(req.body);
    const payrollRun = await PayrollService.createPayrollRun({
      ...validatedData,
      processedBy: validatedData.processedBy || req.user!.uid,
    });
    const payrollRunData = payrollRun.toJSON ? payrollRun.toJSON() : payrollRun;

    ResponseFormatter.success(res, payrollRunData, 'Payroll run created successfully', '', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const processPayrollRun = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to process payroll run'));
    }

    const validatedData = processPayrollRunSchema.parse(req.body);
    const payrollRun = await PayrollService.processPayrollRun(id, validatedData.processedBy);
    const payrollRunData = payrollRun.toJSON ? payrollRun.toJSON() : payrollRun;

    ResponseFormatter.success(res, payrollRunData, 'Payroll run processed successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getPayrollRun = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const payrollRun = await PayrollService.getPayrollRunById(id);
    const payrollRunData = payrollRun.toJSON ? payrollRun.toJSON() : payrollRun;

    ResponseFormatter.success(res, payrollRunData, 'Payroll run retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPayrollRunsByCompany = async (
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      ResponseFormatter.paginated(
        res,
        [],
        0,
        page,
        limit,
        'Payroll runs retrieved successfully'
      );
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await PayrollService.getPayrollRunsByCompany(resolvedCompanyId, page, limit);
    const payrollRunsData = result.rows.map((pr) => (pr.toJSON ? pr.toJSON() : pr));

    ResponseFormatter.paginated(
      res,
      payrollRunsData,
      result.count,
      page,
      limit,
      'Payroll runs retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const lockPayrollRun = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to lock payroll run'));
    }

    const payrollRun = await PayrollService.lockPayrollRun(id, req.user!.uid);
    const payrollRunData = payrollRun.toJSON ? payrollRun.toJSON() : payrollRun;

    ResponseFormatter.success(res, payrollRunData, 'Payroll run locked successfully');
  } catch (error) {
    next(error);
  }
};

export const getPayslip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const payslip = await PayrollService.getPayslipById(id);
    const payslipData = payslip.toJSON ? payslip.toJSON() : payslip;

    ResponseFormatter.success(res, payslipData, 'Payslip retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getPayslipsByEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await PayrollService.getPayslipsByEmployee(employeeId, page, limit);
    const payslipsData = result.rows.map((p) => (p.toJSON ? p.toJSON() : p));

    ResponseFormatter.paginated(
      res,
      payslipsData,
      result.count,
      page,
      limit,
      'Payslips retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getPayslipsByPayrollRun = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { payrollRunId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    const result = await PayrollService.getPayslipsByPayrollRun(payrollRunId, page, limit);
    const payslipsData = result.rows.map((p) => (p.toJSON ? p.toJSON() : p));

    ResponseFormatter.paginated(
      res,
      payslipsData,
      result.count,
      page,
      limit,
      'Payslips retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

