import { Request, Response, NextFunction } from 'express';
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

    // STEP 1: Create user account FIRST with temporary password
    let userCredentials = null;
    try {
      const userCreationResult = await EmployeeService.createUserAccountForEmployee(
        {
          email: req.body.userEmail,
          role: UserRole.EMPLOYEE,
          phoneNumber: req.body.phoneNumber,
          companyName: req.body.companyName,
        },
        req.headers.authorization
      );

      userCredentials = {
        email: userCreationResult.email,
        temporaryPassword: userCreationResult.temporaryPassword,
        mustChangePassword: true,
      };

      logger.info(`User account created for employee: ${req.body.userEmail}`);
    } catch (userError: any) {
      // If user creation fails, don't proceed with employee creation
      logger.error(`Failed to create user account for employee: ${userError.message}`);

      // If user already exists, that's okay - continue with employee creation
      if (!userError.message?.includes('already exists')) {
        // For other errors, fail the entire operation
        return ResponseFormatter.error(
          res,
          'Failed to create user account',
          userError.message,
          400
        );
      }
      logger.info(
        `User account already exists for: ${req.body.userEmail}, proceeding with employee creation`
      );
    }

    // STEP 2: Create employee record AFTER user account is created
    const employee = await EmployeeService.createEmployee(req.body);

    ResponseFormatter.success(
      res,
      {
        employee,
        userCredentials,
      },
      'Employee created successfully',
      userCredentials
        ? 'User account created. Employee must change password on first login.'
        : 'Employee created. User account may already exist.',
      201
    );
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
    const employee = await EmployeeService.getEmployeeByAnyEmail(req.user.email);
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
            id: req.user.userId,
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
            id: req.user.userId,
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

export const bulkAssignManager = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { newManagerId, employeeIds } = req.body;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    if (!AccessControl.canAccessAllCompanies(userRole) && !userCompanyId) {
      return ResponseFormatter.error(res, 'Company context required', '', 403);
    }

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return next(new ValidationError('employeeIds must be a non-empty array'));
    }

    if (!newManagerId) {
      return next(new ValidationError('newManagerId is required'));
    }

    const { successCount, failureCount, errors } = await EmployeeService.bulkAssignManager(
      employeeIds,
      newManagerId
    );

    if (failureCount === 0) {
      ResponseFormatter.success(res, { successCount }, 'All employees assigned successfully');
    } else if (successCount === 0) {
      ResponseFormatter.error(res, 'Failed to assign any employees', JSON.stringify(errors), 400);
    } else {
      ResponseFormatter.success(
        res,
        { successCount, failureCount, errors },
        'Partial success in assigning managers'
      );
    }
  } catch (error) {
    next(error);
  }
};

export const createOnboardingEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, companyId, department, designation, workLocation, employmentType, dateOfJoining, workEmail, workPhone, firstName, lastName, userEmail } = req.body;

    if (!userId || !companyId || !firstName || !lastName || !userEmail) {
      return ResponseFormatter.error(res, 'User ID, Company ID, First Name, Last Name, and User Email are required', '', 400);
    }

    const employee = await EmployeeService.createEmployee({
      userEmail,
      companyId,
      employeeId: userId,
      firstName,
      lastName,
      userCompEmail: workEmail || userEmail,
      phoneNumber: workPhone,
      jobTitle: designation || 'Company Administrator',
      department: department || 'Management',
      hireDate: new Date(dateOfJoining || new Date()),
    });

    ResponseFormatter.success(res, employee, 'Employee created successfully');
  } catch (error) {
    next(error);
  }
};

export const getPotentialManagers = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { searchTerm } = req.query;
    const userRole = req.user?.role as UserRole;
    const userCompanyId = req.employee?.companyId;

    let companyId = AccessControl.canAccessAllCompanies(userRole)
      ? (req.query.companyId as string)
      : userCompanyId;

    // If company ID is not provided (e.g. super admin), infer it from the target employee
    if (!companyId) {
      const employee = await EmployeeService.getEmployeeById(id);
      companyId = employee.companyId;
    }

    if (!companyId) {
      return ResponseFormatter.error(res, 'Company ID required', '', 400);
    }

    const eligibleManagers = await EmployeeService.getPotentialManagers(
      id,
      companyId,
      searchTerm as string
    );
    ResponseFormatter.success(res, eligibleManagers, 'Potential managers retrieved successfully');
  } catch (error) {
    next(error);
  }
};
