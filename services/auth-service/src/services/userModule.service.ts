import { UserModule } from '../models/UserModule.model';
import { UserModuleQueries } from '../queries/userModule.queries';
import { NotFoundError, ConflictError, ValidationError } from '@hrm/common';
import { User } from '../models/User.model';
import { UserRole } from '@hrm/common';

const VALID_MODULE_KEYS = [
  'employees',
  'payroll',
  'leave',
  'attendance',
  'approvals',
  'departments',
  'companies',
  'reports',
  'settings',
] as const;

const MODULE_NAMES: Record<string, string> = {
  employees: 'Employee Management',
  payroll: 'Payroll Management',
  leave: 'Leave Management',
  attendance: 'Attendance Management',
  approvals: 'Approval Management',
  departments: 'Department Management',
  companies: 'Company Management',
  reports: 'Reports & Analytics',
  settings: 'Settings Management',
};

export class UserModuleService {
  static async assignModule(data: {
    userId: string;
    moduleKey: string;
    moduleName?: string;
  }): Promise<UserModule> {
    const user = await User.findByPk(data.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userRole = user.role as UserRole;
    const allowedRoles = [UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF, UserRole.HRBP];
    if (!allowedRoles.includes(userRole)) {
      throw new ValidationError('Module assignment is only allowed for users at levels 2, 3, and 4');
    }

    if (!VALID_MODULE_KEYS.includes(data.moduleKey as any)) {
      throw new ValidationError(`Invalid module key. Valid keys are: ${VALID_MODULE_KEYS.join(', ')}`);
    }

    const existingModule = await UserModuleQueries.findByUserAndModule(data.userId, data.moduleKey);
    if (existingModule) {
      throw new ConflictError('Module already assigned to this user');
    }

    const moduleName = data.moduleName || MODULE_NAMES[data.moduleKey] || data.moduleKey;

    return await UserModuleQueries.create({
      userId: data.userId,
      moduleKey: data.moduleKey,
      moduleName,
      isActive: true,
    });
  }

  static async getUserModules(userId: string, isActive?: boolean): Promise<UserModule[]> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return await UserModuleQueries.findByUser(userId, isActive);
  }

  static async getAllUserModules(userId?: string, isActive?: boolean): Promise<UserModule[]> {
    return await UserModuleQueries.findAll(userId, isActive);
  }

  static async getUserModuleById(id: string): Promise<UserModule> {
    const userModule = await UserModuleQueries.findById(id);
    if (!userModule) {
      throw new NotFoundError('User module not found');
    }
    return userModule;
  }

  static async updateUserModule(
    id: string,
    data: {
      moduleName?: string;
      isActive?: boolean;
    }
  ): Promise<UserModule> {
    const userModule = await UserModuleQueries.findById(id);
    if (!userModule) {
      throw new NotFoundError('User module not found');
    }

    await UserModuleQueries.update(id, data);
    const updatedModule = await UserModuleQueries.findById(id);
    if (!updatedModule) {
      throw new NotFoundError('User module not found');
    }

    return updatedModule;
  }

  static async removeUserModule(id: string): Promise<void> {
    const userModule = await UserModuleQueries.findById(id);
    if (!userModule) {
      throw new NotFoundError('User module not found');
    }

    const affectedCount = await UserModuleQueries.delete(id);
    if (affectedCount === 0) {
      throw new NotFoundError('User module not found');
    }
  }

  static async removeUserModuleByKey(userId: string, moduleKey: string): Promise<void> {
    const affectedCount = await UserModuleQueries.deleteByUserAndModule(userId, moduleKey);
    if (affectedCount === 0) {
      throw new NotFoundError('User module not found');
    }
  }

  static getValidModuleKeys(): string[] {
    return [...VALID_MODULE_KEYS];
  }

  static getModuleNames(): Record<string, string> {
    return { ...MODULE_NAMES };
  }
}

