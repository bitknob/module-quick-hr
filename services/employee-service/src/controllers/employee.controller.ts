import { Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import {
  AccessControl,
  UserRole,
  ResponseFormatter,
  NotFoundError,
  ValidationError,
  logger,
} from '@hrm/common';
import { EnrichedAuthRequest } from '../middleware/accessControl';
import { DocumentService } from '../services/document.service';
import { DocumentType, DocumentStatus } from '../models/EmployeeDocument.model';
import { EmployeeDetailService } from '../services/employeeDetail.service';

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

    // Validate that id is a valid UUID format - prevent route conflicts with special paths
    // Common non-UUID paths that shouldn't match this route
    const reservedPaths = ['documents', 'attendance', 'leaves', 'details', 'approvals'];
    if (reservedPaths.includes(id)) {
      return next(new NotFoundError('Endpoint'));
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || id === 'undefined' || !uuidRegex.test(id)) {
      return next(new NotFoundError('Employee'));
    }

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
  if (!req.user?.email) {
    return ResponseFormatter.error(res, 'User not authenticated', '', 401);
  }

  // Check if user can access all companies (super_admin, provider_admin, provider_hr_staff)
  // This allows users without employee records to still access the system
  const roleString = req.user?.role;
  const canAccessAll = roleString
    ? AccessControl.canAccessAllCompanies(roleString as UserRole)
    : false;

  // Try to get employee record
  try {
    const employee = await EmployeeService.getEmployeeByUserEmail(req.user.email);
    ResponseFormatter.success(res, employee, 'Current employee retrieved successfully');
    return;
  } catch (error: any) {
    // Handle employee not found case - always return 200, never 404
    // Check for NotFoundError or any 404 error related to employee
    const isEmployeeNotFound =
      (error instanceof NotFoundError || error?.statusCode === 404) &&
      (error?.message?.includes('Employee') || error?.message?.includes('not found'));

    if (isEmployeeNotFound) {
      // Prevent error from propagating - always return 200 status
      // Do NOT call next(error) - handle it here to avoid 404 status
      if (canAccessAll) {
        // Super Admin or Provider Admin without employee record
        // Return user information instead of 404
        ResponseFormatter.success(
          res,
          {
            id: req.user.uid,
            userEmail: req.user.email,
            email: req.user.email,
            role: req.user.role,
            isSuperAdmin: true,
            hasEmployeeRecord: false,
          },
          'User information retrieved successfully (no employee record)'
        );
        return; // Important: return here to prevent error from propagating
      } else {
        // Regular users without employee record
        // Return 200 status with error information in response body
        ResponseFormatter.success(
          res,
          {
            id: req.user.uid,
            userEmail: req.user.email,
            email: req.user.email,
            role: req.user.role,
            hasEmployeeRecord: false,
            error: 'Employee profile not found',
          },
          'Employee profile not found',
          'Your employee profile has not been set up yet. Please contact your administrator.'
        );
        return; // Important: return here to prevent error from propagating
      }
    }

    // For other errors, pass to error handler
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

    const hierarchy = await EmployeeService.getHierarchyTree(rootId as string | undefined);
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

export const getCurrentEmployeeDocuments = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.employee?.id) {
      ResponseFormatter.success(res, [], 'Documents retrieved successfully (no employee record)');
      return;
    }

    const companyId = req.query.companyId as string | undefined;
    const documentType = req.query.documentType as DocumentType | undefined;
    const status = req.query.status as DocumentStatus | undefined;

    const documents = await DocumentService.getDocumentsByEmployee(
      req.employee.id,
      companyId,
      documentType,
      status
    );
    const documentsData = documents.map((d) => (d.toJSON ? d.toJSON() : d));

    ResponseFormatter.success(res, documentsData, 'Documents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getCurrentEmployeeDetails = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.employee?.id) {
      // Return HTTP 200 with 404 in response body to prevent UI error pages
      ResponseFormatter.success(
        res,
        null,
        'Employee record not found',
        'Please create an employee profile to access this information.',
        200,
        404 // responseCode in body
      );
      return;
    }

    const companyId = req.query.companyId as string | undefined;
    const detail = await EmployeeDetailService.getDetailByEmployeeId(
      req.employee.id,
      companyId || req.employee.companyId
    );
    const detailData = detail.toJSON ? detail.toJSON() : detail;

    ResponseFormatter.success(res, detailData, 'Employee detail retrieved successfully');
  } catch (error: any) {
    if (error instanceof NotFoundError && error.message?.includes('Employee detail')) {
      // Return HTTP 200 with 404 in response body to prevent UI error pages
      ResponseFormatter.success(
        res,
        null,
        'Employee detail not found',
        'No additional details have been added for this employee yet.',
        200,
        404 // responseCode in body
      );
      return;
    }
    next(error);
  }
};
