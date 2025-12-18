import { Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import { AccessControl, UserRole, ResponseFormatter, NotFoundError } from '@hrm/common';
import { EnrichedAuthRequest } from '../middleware/accessControl';

export const createEmployee = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    if (!AccessControl.canAccessAllCompanies(userRole) && !userCompanyId) {
      return ResponseFormatter.error(res, 'Company context required', '', 403);
    }

    if (!AccessControl.canAccessAllCompanies(userRole) && req.body.companyId !== userCompanyId) {
      return ResponseFormatter.error(res, 'Cannot create employee in different company', '', 403);
    }

    if (!req.body.companyId && userCompanyId) {
      req.body.companyId = userCompanyId;
    }

    const employee = await EmployeeService.createEmployee(req.body);
    ResponseFormatter.success(res, employee, 'Employee created successfully', '', 201);
  } catch (error) {
    next(error);
  }
};

export const getEmployee = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;
    const employee = await EmployeeService.getEmployeeById(id, companyId);
    ResponseFormatter.success(res, employee, 'Employee retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getCurrentEmployee = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.uid) {
      return ResponseFormatter.error(res, 'User not authenticated', '', 401);
    }

    const userRole = req.user?.role as UserRole;
    const canAccessAll = AccessControl.canAccessAllCompanies(userRole);

    try {
      const employee = await EmployeeService.getEmployeeByUserId(req.user.uid);
      ResponseFormatter.success(res, employee, 'Current employee retrieved successfully');
    } catch (error) {
      if (error instanceof NotFoundError && canAccessAll) {
        // Super Admin or Provider Admin without employee record
        // Return user information instead
        ResponseFormatter.success(
          res,
          {
            id: null,
            userId: req.user.uid,
            email: req.user.email,
            role: req.user.role,
            isSuperAdmin: true,
            hasEmployeeRecord: false,
          },
          'User information retrieved successfully (no employee record)'
        );
      } else {
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;
    const employee = await EmployeeService.updateEmployee(id, req.body, companyId);
    ResponseFormatter.success(res, employee, 'Employee updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await EmployeeService.deleteEmployee(id);
    ResponseFormatter.success(res, null, 'Employee deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getDirectReports = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { managerId } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;
    const employees = await EmployeeService.getDirectReports(managerId, companyId);
    ResponseFormatter.success(res, employees, 'Direct reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAllSubordinates = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { managerId } = req.params;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    const companyId = AccessControl.canAccessAllCompanies(userRole) ? undefined : userCompanyId;
    const employees = await EmployeeService.getAllSubordinates(managerId, companyId);
    ResponseFormatter.success(res, employees, 'All subordinates retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getHierarchyTree = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rootId, companyId } = req.query;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    let filterCompanyId: string | undefined = companyId as string | undefined;
    if (!AccessControl.canAccessAllCompanies(userRole)) {
      filterCompanyId = userCompanyId;
    }

    const hierarchy = await EmployeeService.getHierarchyTree(
      rootId as string | undefined
    );
    ResponseFormatter.success(res, hierarchy, 'Hierarchy tree retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const searchEmployees = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { department, jobTitle, status, searchTerm, companyId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    let filterCompanyId: string | undefined = companyId as string | undefined;

    if (!AccessControl.canAccessAllCompanies(userRole)) {
      filterCompanyId = userCompanyId;
    }

    const result = await EmployeeService.searchEmployees(
      {
        companyId: filterCompanyId,
        department: department as string,
        jobTitle: jobTitle as string,
        status: status as string,
        searchTerm: searchTerm as string,
      },
      page,
      limit
    );

    ResponseFormatter.paginated(
      res,
      result.employees,
      result.total,
      page,
      limit,
      'Employees retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const transferEmployee = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { newManagerId } = req.body;
    const employee = await EmployeeService.transferEmployee(id, newManagerId || null);
    ResponseFormatter.success(res, employee, 'Employee transferred successfully');
  } catch (error) {
    next(error);
  }
};

