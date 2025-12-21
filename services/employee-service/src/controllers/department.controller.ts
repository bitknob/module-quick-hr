import { Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { AccessControl, UserRole, ResponseFormatter } from '@hrm/common';
import { EnrichedAuthRequest } from '../middleware/accessControl';

export const getAllDepartments = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.query;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    let filterCompanyId: string | undefined;
    if (companyId) {
      filterCompanyId = companyId as string;
    } else if (!AccessControl.canAccessAllCompanies(userRole) && userCompanyId) {
      filterCompanyId = userCompanyId;
    }

    const departments = await DepartmentService.getAllDepartments(filterCompanyId);
    ResponseFormatter.success(res, departments, 'Departments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getDepartment = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;
    const department = await DepartmentService.getDepartmentById(id, companyId);
    ResponseFormatter.success(res, department, 'Department retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId, name, description, headId, parentDepartmentId, hasSubDepartments } = req.body;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    if (!companyId || !name) {
      return ResponseFormatter.error(res, 'Company ID and name are required', '', 400);
    }

    if (!AccessControl.canAccessAllCompanies(userRole) && userCompanyId && userCompanyId !== companyId) {
      return ResponseFormatter.error(res, 'Access denied: Cannot create department in different company', '', 403);
    }

    const department = await DepartmentService.createDepartment({
      companyId,
      name,
      description,
      headId,
      parentDepartmentId,
      hasSubDepartments,
    });

    ResponseFormatter.success(res, department, 'Department created successfully', '', 201);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const { name, description, headId, parentDepartmentId, hasSubDepartments } = req.body;

    const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;
    const department = await DepartmentService.updateDepartment(id, {
      name,
      description,
      headId,
      parentDepartmentId,
      hasSubDepartments,
    }, companyId);

    ResponseFormatter.success(res, department, 'Department updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;
    await DepartmentService.deleteDepartment(id, companyId);
    ResponseFormatter.success(res, null, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getSubDepartments = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;
    const subDepartments = await DepartmentService.getSubDepartments(id, companyId);
    ResponseFormatter.success(res, subDepartments, 'Sub-departments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getTopLevelDepartments = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.query;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    if (!companyId) {
      return ResponseFormatter.error(res, 'Company ID is required', '', 400);
    }

    if (!AccessControl.canAccessAllCompanies(userRole) && userCompanyId && userCompanyId !== companyId) {
      return ResponseFormatter.error(res, 'Access denied: Cannot access departments from different company', '', 403);
    }

    const departments = await DepartmentService.getTopLevelDepartments(companyId as string);
    ResponseFormatter.success(res, departments, 'Top-level departments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

