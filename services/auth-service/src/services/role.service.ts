import { Role, RoleAttributes, RoleCreationAttributes } from '../models/Role.model';
import { NotFoundError, ValidationError, ForbiddenError } from '@hrm/common';

export interface CreateRoleDto {
  roleKey: string;
  name: string;
  description?: string;
  hierarchyLevel: number;
  parentRoleId?: string;
  companyId?: string;
  permissions?: Record<string, any>;
  menuAccess?: string[];
  canAccessAllCompanies?: boolean;
  canAccessMultipleCompanies?: boolean;
  canAccessSingleCompany?: boolean;
  canManageCompanies?: boolean;
  canCreateCompanies?: boolean;
  canManageProviderStaff?: boolean;
  canManageEmployees?: boolean;
  canApproveLeaves?: boolean;
  canViewPayroll?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  hierarchyLevel?: number;
  parentRoleId?: string;
  permissions?: Record<string, any>;
  menuAccess?: string[];
  canAccessAllCompanies?: boolean;
  canAccessMultipleCompanies?: boolean;
  canAccessSingleCompany?: boolean;
  canManageCompanies?: boolean;
  canCreateCompanies?: boolean;
  canManageProviderStaff?: boolean;
  canManageEmployees?: boolean;
  canApproveLeaves?: boolean;
  canViewPayroll?: boolean;
  isActive?: boolean;
}

export class RoleService {
  static readonly SYSTEM_ROLES: Record<string, { name: string; hierarchyLevel: number }> = {
    super_admin: { name: 'Super Admin', hierarchyLevel: 1 },
    provider_admin: { name: 'Provider Admin', hierarchyLevel: 2 },
    provider_hr_staff: { name: 'Provider HR Staff', hierarchyLevel: 3 },
    hrbp: { name: 'HRBP', hierarchyLevel: 4 },
    company_admin: { name: 'Company Admin', hierarchyLevel: 5 },
    department_head: { name: 'Department Head', hierarchyLevel: 6 },
    manager: { name: 'Manager', hierarchyLevel: 7 },
    employee: { name: 'Employee', hierarchyLevel: 8 },
  };

  static async initializeSystemRoles(): Promise<void> {
    for (const [roleKey, roleData] of Object.entries(this.SYSTEM_ROLES)) {
      const existingRole = await Role.findOne({ where: { roleKey } });
      if (!existingRole) {
        await Role.create({
          roleKey,
          name: roleData.name,
          description: this.getSystemRoleDescription(roleKey),
          hierarchyLevel: roleData.hierarchyLevel,
          isSystemRole: true,
          isActive: true,
          permissions: {},
          menuAccess: [],
          ...this.getSystemRolePermissions(roleKey),
        });
      }
    }
  }

  private static getSystemRoleDescription(roleKey: string): string {
    const descriptions: Record<string, string> = {
      super_admin: 'Full system access, can manage all companies. Has unrestricted access to all data and can override approval workflows, view/edit any employee records, and configure system-wide settings across all companies.',
      provider_admin: 'Manages provider HR team, access to all companies',
      provider_hr_staff: 'Handles shared services, access to multiple/all companies',
      hrbp: 'Dedicated HR Business Partner, assigned to one company',
      company_admin: 'Local admin within one company',
      department_head: 'Top-level manager within company',
      manager: 'Direct reporting manager',
      employee: 'Base level, self-service only',
    };
    return descriptions[roleKey] || '';
  }

  private static getSystemRolePermissions(roleKey: string): Partial<RoleAttributes> {
    const permissions: Record<string, Partial<RoleAttributes>> = {
      super_admin: {
        canAccessAllCompanies: true,
        canAccessMultipleCompanies: true,
        canManageCompanies: true,
        canCreateCompanies: true,
        canManageProviderStaff: true,
        canManageEmployees: true,
        canApproveLeaves: true,
        canViewPayroll: true,
      },
      provider_admin: {
        canAccessAllCompanies: true,
        canAccessMultipleCompanies: true,
        canManageCompanies: false,
        canCreateCompanies: false,
        canManageProviderStaff: true,
        canManageEmployees: true,
        canApproveLeaves: true,
        canViewPayroll: true,
      },
      provider_hr_staff: {
        canAccessAllCompanies: true,
        canAccessMultipleCompanies: true,
        canManageCompanies: false,
        canCreateCompanies: false,
        canManageProviderStaff: false,
        canManageEmployees: true,
        canApproveLeaves: true,
        canViewPayroll: true,
      },
      hrbp: {
        canAccessAllCompanies: false,
        canAccessMultipleCompanies: false,
        canAccessSingleCompany: true,
        canManageCompanies: false,
        canCreateCompanies: false,
        canManageProviderStaff: false,
        canManageEmployees: true,
        canApproveLeaves: true,
        canViewPayroll: true,
      },
      company_admin: {
        canAccessAllCompanies: false,
        canAccessMultipleCompanies: false,
        canAccessSingleCompany: true,
        canManageCompanies: false,
        canCreateCompanies: false,
        canManageProviderStaff: false,
        canManageEmployees: true,
        canApproveLeaves: true,
        canViewPayroll: true,
      },
      department_head: {
        canAccessAllCompanies: false,
        canAccessMultipleCompanies: false,
        canAccessSingleCompany: true,
        canManageCompanies: false,
        canCreateCompanies: false,
        canManageProviderStaff: false,
        canManageEmployees: false,
        canApproveLeaves: true,
        canViewPayroll: false,
      },
      manager: {
        canAccessAllCompanies: false,
        canAccessMultipleCompanies: false,
        canAccessSingleCompany: true,
        canManageCompanies: false,
        canCreateCompanies: false,
        canManageProviderStaff: false,
        canManageEmployees: false,
        canApproveLeaves: true,
        canViewPayroll: false,
      },
      employee: {
        canAccessAllCompanies: false,
        canAccessMultipleCompanies: false,
        canAccessSingleCompany: true,
        canManageCompanies: false,
        canCreateCompanies: false,
        canManageProviderStaff: false,
        canManageEmployees: false,
        canApproveLeaves: false,
        canViewPayroll: false,
      },
    };
    return permissions[roleKey] || {};
  }

  static async createRole(data: CreateRoleDto, createdBy: string): Promise<Role> {
    if (data.hierarchyLevel < 1 || data.hierarchyLevel > 8) {
      throw new ValidationError('Hierarchy level must be between 1 and 8');
    }

    const existingRole = await Role.findOne({ where: { roleKey: data.roleKey } });
    if (existingRole) {
      throw new ValidationError(`Role with key "${data.roleKey}" already exists`);
    }

    if (data.parentRoleId) {
      const parentRole = await Role.findByPk(data.parentRoleId);
      if (!parentRole) {
        throw new NotFoundError('Parent role not found');
      }
      if (parentRole.hierarchyLevel >= data.hierarchyLevel) {
        throw new ValidationError('Parent role hierarchy level must be lower than child role');
      }
    }

    const role = await Role.create({
      ...data,
      permissions: data.permissions || {},
      menuAccess: data.menuAccess || [],
      createdBy,
    });

    return role;
  }

  static async getRoleById(id: string): Promise<Role> {
    const role = await Role.findByPk(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    return role;
  }

  static async getRoleByKey(roleKey: string): Promise<Role> {
    const role = await Role.findOne({ where: { roleKey } });
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    return role;
  }

  static async getAllRoles(filters?: {
    companyId?: string;
    isSystemRole?: boolean;
    isActive?: boolean;
    hierarchyLevel?: number;
  }): Promise<Role[]> {
    const where: any = {};

    if (filters?.companyId !== undefined) {
      where.companyId = filters.companyId;
    }

    if (filters?.isSystemRole !== undefined) {
      where.isSystemRole = filters.isSystemRole;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.hierarchyLevel !== undefined) {
      where.hierarchyLevel = filters.hierarchyLevel;
    }

    return await Role.findAll({
      where,
      order: [['hierarchyLevel', 'ASC'], ['name', 'ASC']],
    });
  }

  static async getRoleHierarchy(roleId: string): Promise<Role[]> {
    const role = await this.getRoleById(roleId);
    const hierarchy: Role[] = [role];

    let currentRole = role;
    while (currentRole.parentRoleId) {
      const parentRole = await Role.findByPk(currentRole.parentRoleId);
      if (!parentRole) {
        break;
      }
      hierarchy.unshift(parentRole);
      currentRole = parentRole;
    }

    const childRoles = await Role.findAll({
      where: { parentRoleId: roleId },
      order: [['hierarchyLevel', 'ASC']],
    });

    hierarchy.push(...childRoles);

    return hierarchy;
  }

  static async updateRole(id: string, data: UpdateRoleDto, updatedBy: string): Promise<Role> {
    const role = await this.getRoleById(id);

    if (role.isSystemRole) {
      throw new ForbiddenError('Cannot modify system roles');
    }

    if (data.hierarchyLevel !== undefined) {
      if (data.hierarchyLevel < 1 || data.hierarchyLevel > 8) {
        throw new ValidationError('Hierarchy level must be between 1 and 8');
      }

      if (data.hierarchyLevel <= role.hierarchyLevel && role.parentRoleId) {
        const parentRole = await Role.findByPk(role.parentRoleId);
        if (parentRole && parentRole.hierarchyLevel >= data.hierarchyLevel) {
          throw new ValidationError('Hierarchy level must be higher than parent role');
        }
      }
    }

    if (data.parentRoleId !== undefined) {
      if (data.parentRoleId === id) {
        throw new ValidationError('Role cannot be its own parent');
      }

      if (data.parentRoleId) {
        const parentRole = await Role.findByPk(data.parentRoleId);
        if (!parentRole) {
          throw new NotFoundError('Parent role not found');
        }

        const effectiveHierarchyLevel = data.hierarchyLevel || role.hierarchyLevel;
        if (parentRole.hierarchyLevel >= effectiveHierarchyLevel) {
          throw new ValidationError('Parent role hierarchy level must be lower than child role');
        }

        const hasCircularReference = await this.checkCircularReference(id, data.parentRoleId);
        if (hasCircularReference) {
          throw new ValidationError('Circular reference detected in role hierarchy');
        }
      }
    }

    await role.update({
      ...data,
      updatedBy,
    });

    return role.reload();
  }

  private static async checkCircularReference(roleId: string, parentRoleId: string): Promise<boolean> {
    let currentParentId = parentRoleId;
    const visited = new Set<string>();

    while (currentParentId) {
      if (visited.has(currentParentId) || currentParentId === roleId) {
        return true;
      }
      visited.add(currentParentId);

      const parentRole = await Role.findByPk(currentParentId);
      if (!parentRole || !parentRole.parentRoleId) {
        break;
      }
      currentParentId = parentRole.parentRoleId;
    }

    return false;
  }

  static async deleteRole(id: string): Promise<void> {
    const role = await this.getRoleById(id);

    if (role.isSystemRole) {
      throw new ForbiddenError('Cannot delete system roles');
    }

    const childRoles = await Role.count({ where: { parentRoleId: id } });
    if (childRoles > 0) {
      throw new ValidationError('Cannot delete role with child roles. Please reassign or delete child roles first.');
    }

    await role.destroy();
  }

  static async getRolesByHierarchyLevel(level: number): Promise<Role[]> {
    return await Role.findAll({
      where: { hierarchyLevel: level, isActive: true },
      order: [['name', 'ASC']],
    });
  }

  static async getChildRoles(roleId: string): Promise<Role[]> {
    return await Role.findAll({
      where: { parentRoleId: roleId },
      order: [['hierarchyLevel', 'ASC'], ['name', 'ASC']],
    });
  }

  static async getParentRoles(roleId: string): Promise<Role[]> {
    const role = await this.getRoleById(roleId);
    const parents: Role[] = [];

    let currentRole = role;
    while (currentRole.parentRoleId) {
      const parentRole = await Role.findByPk(currentRole.parentRoleId);
      if (!parentRole) {
        break;
      }
      parents.unshift(parentRole);
      currentRole = parentRole;
    }

    return parents;
  }

  static async assignMenuAccess(roleId: string, menuIds: string[]): Promise<Role> {
    const role = await this.getRoleById(roleId);
    await role.update({ menuAccess: menuIds });
    return role.reload();
  }

  static async updatePermissions(roleId: string, permissions: Record<string, any>): Promise<Role> {
    const role = await this.getRoleById(roleId);
    await role.update({ permissions });
    return role.reload();
  }
}

