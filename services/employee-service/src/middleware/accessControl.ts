import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '@hrm/common';
import { EmployeeQueries } from '../queries/employee.queries';
import { AccessControl } from '@hrm/common';
import { UserRole } from '@hrm/common';
import { ForbiddenError } from '@hrm/common';

export interface EnrichedAuthRequest extends AuthRequest {
  employee?: {
    id: string;
    companyId: string;
    managerId?: string;
  };
}

export const enrichEmployeeContext = async (
  req: EnrichedAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.email) {
      return next();
    }

    const employee = await EmployeeQueries.findByAnyEmail(req.user.email);
    if (employee) {
      req.employee = {
        id: employee.id,
        companyId: employee.companyId,
        managerId: employee.managerId || undefined,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkCompanyAccess = (targetCompanyId?: string) => {
  return async (req: EnrichedAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.role) {
        return next(new ForbiddenError('User role not found'));
      }

      const userRole = req.user.role as UserRole;
      const userCompanyId = req.employee?.companyId;

      if (AccessControl.canAccessAllCompanies(userRole)) {
        return next();
      }

      if (targetCompanyId && userCompanyId && targetCompanyId !== userCompanyId) {
        return next(new ForbiddenError('Access denied: Different company'));
      }

      if (!AccessControl.canAccessSingleCompany(userRole)) {
        return next(new ForbiddenError('Access denied: Insufficient permissions'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkEmployeeAccess = () => {
  return async (req: EnrichedAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.role) {
        return next(new ForbiddenError('User role not found'));
      }

      const userRole = req.user.role as UserRole;
      const targetEmployeeId = req.params.id;

      if (!targetEmployeeId) {
        return next();
      }

      // Super admins and provider admins can access all employees without employee context
      if (AccessControl.canAccessAllCompanies(userRole)) {
        return next();
      }

      // For other roles, employee context is required
      if (!req.employee) {
        return next(new ForbiddenError('Employee context not found'));
      }

      const targetEmployee = await EmployeeQueries.findById(targetEmployeeId);
      if (!targetEmployee) {
        return next();
      }

      if (userRole === UserRole.EMPLOYEE) {
        if (req.employee.id !== targetEmployeeId) {
          return next(new ForbiddenError('Access denied: Can only access own data'));
        }
        return next();
      }

      if (req.employee.companyId !== targetEmployee.companyId) {
        return next(new ForbiddenError('Access denied: Different company'));
      }

      if ([UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(userRole)) {
        return next();
      }

      if ([UserRole.DEPARTMENT_HEAD, UserRole.MANAGER].includes(userRole)) {
        const subordinates = await EmployeeQueries.findAllSubordinates(
          req.employee.id,
          req.employee.companyId
        );
        const hasAccess =
          subordinates.some((emp) => emp.id === targetEmployeeId) ||
          req.employee.id === targetEmployeeId;

        if (!hasAccess) {
          return next(new ForbiddenError('Access denied: Employee not in your team'));
        }
        return next();
      }

      return next(new ForbiddenError('Access denied: Insufficient permissions'));
    } catch (error) {
      next(error);
    }
  };
};
