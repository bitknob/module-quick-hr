import { UserRole } from '../types';
import { AuthRequest } from '../middleware/auth';

export interface AccessContext {
  userRole: UserRole;
  userId: string;
  companyId?: string;
  employeeId?: string;
  managerId?: string;
}

export class AccessControl {
  static canAccessAllCompanies(role: UserRole): boolean {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.PROVIDER_ADMIN,
      UserRole.PROVIDER_HR_STAFF,
    ].includes(role);
  }

  static canAccessMultipleCompanies(role: UserRole): boolean {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.PROVIDER_ADMIN,
      UserRole.PROVIDER_HR_STAFF,
    ].includes(role);
  }

  static canAccessSingleCompany(role: UserRole): boolean {
    return [
      UserRole.HRBP,
      UserRole.COMPANY_ADMIN,
      UserRole.DEPARTMENT_HEAD,
      UserRole.MANAGER,
      UserRole.EMPLOYEE,
    ].includes(role);
  }

  static canManageCompanies(role: UserRole): boolean {
    return role === UserRole.SUPER_ADMIN;
  }

  static canCreateCompanies(role: UserRole): boolean {
    return role === UserRole.SUPER_ADMIN;
  }

  static canManageProviderStaff(role: UserRole): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(role);
  }

  static canAccessCompanyData(role: UserRole, targetCompanyId: string, userCompanyId?: string): boolean {
    if (this.canAccessAllCompanies(role)) {
      return true;
    }

    if (this.canAccessSingleCompany(role)) {
      return userCompanyId === targetCompanyId;
    }

    return false;
  }

  static canAccessEmployee(
    role: UserRole,
    targetEmployeeId: string,
    targetCompanyId: string,
    context: AccessContext
  ): boolean {
    if (this.canAccessAllCompanies(role)) {
      return true;
    }

    if (role === UserRole.EMPLOYEE) {
      return context.employeeId === targetEmployeeId;
    }

    if (this.canAccessSingleCompany(role)) {
      if (context.companyId !== targetCompanyId) {
        return false;
      }

      if (role === UserRole.HRBP || role === UserRole.COMPANY_ADMIN) {
        return true;
      }

      if (role === UserRole.DEPARTMENT_HEAD || role === UserRole.MANAGER) {
        return this.isInSubtree(context.managerId, targetEmployeeId);
      }
    }

    return false;
  }

  static canManageEmployees(role: UserRole): boolean {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.PROVIDER_ADMIN,
      UserRole.PROVIDER_HR_STAFF,
      UserRole.HRBP,
      UserRole.COMPANY_ADMIN,
    ].includes(role);
  }

  static canApproveLeaves(role: UserRole): boolean {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.PROVIDER_ADMIN,
      UserRole.PROVIDER_HR_STAFF,
      UserRole.HRBP,
      UserRole.COMPANY_ADMIN,
      UserRole.DEPARTMENT_HEAD,
      UserRole.MANAGER,
    ].includes(role);
  }

  static canViewPayroll(role: UserRole, targetEmployeeId: string, context: AccessContext): boolean {
    if (this.canAccessAllCompanies(role)) {
      return true;
    }

    if (role === UserRole.EMPLOYEE) {
      return context.employeeId === targetEmployeeId;
    }

    if ([UserRole.HRBP, UserRole.COMPANY_ADMIN].includes(role)) {
      return context.companyId !== undefined;
    }

    return false;
  }

  private static isInSubtree(managerId: string | undefined, targetEmployeeId: string): boolean {
    if (!managerId) {
      return false;
    }
    return managerId === targetEmployeeId;
  }

  static async isEmployeeInSubtree(
    managerId: string,
    targetEmployeeId: string,
    checkSubtreeFn: (managerId: string) => Promise<string[]>
  ): Promise<boolean> {
    if (managerId === targetEmployeeId) {
      return true;
    }

    const subordinates = await checkSubtreeFn(managerId);
    return subordinates.some((emp: any) => emp.id === targetEmployeeId);
  }

  static getAccessibleCompanyIds(role: UserRole, userCompanyId?: string): string[] | null {
    if (this.canAccessAllCompanies(role)) {
      return null;
    }

    if (this.canAccessSingleCompany(role) && userCompanyId) {
      return [userCompanyId];
    }

    return [];
  }
}

