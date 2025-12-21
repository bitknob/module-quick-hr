import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '@hrm/common';
import { RoleService, CreateRoleDto, UpdateRoleDto } from '../services/role.service';
import { ResponseFormatter, ValidationError, UserRole } from '@hrm/common';
import { z } from 'zod';

const createRoleSchema = z.object({
  roleKey: z.string().min(1, 'Role key is required').max(50, 'Role key must be 50 characters or less'),
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  hierarchyLevel: z.number().int().min(1).max(8),
  parentRoleId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  permissions: z.record(z.any()).optional(),
  menuAccess: z.array(z.string()).optional(),
  canAccessAllCompanies: z.boolean().optional(),
  canAccessMultipleCompanies: z.boolean().optional(),
  canAccessSingleCompany: z.boolean().optional(),
  canManageCompanies: z.boolean().optional(),
  canCreateCompanies: z.boolean().optional(),
  canManageProviderStaff: z.boolean().optional(),
  canManageEmployees: z.boolean().optional(),
  canApproveLeaves: z.boolean().optional(),
  canViewPayroll: z.boolean().optional(),
});

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  hierarchyLevel: z.number().int().min(1).max(8).optional(),
  parentRoleId: z.string().uuid().optional(),
  permissions: z.record(z.any()).optional(),
  menuAccess: z.array(z.string()).optional(),
  canAccessAllCompanies: z.boolean().optional(),
  canAccessMultipleCompanies: z.boolean().optional(),
  canAccessSingleCompany: z.boolean().optional(),
  canManageCompanies: z.boolean().optional(),
  canCreateCompanies: z.boolean().optional(),
  canManageProviderStaff: z.boolean().optional(),
  canManageEmployees: z.boolean().optional(),
  canApproveLeaves: z.boolean().optional(),
  canViewPayroll: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to create roles'));
    }

    const validatedData = createRoleSchema.parse(req.body);
    const role = await RoleService.createRole(validatedData, req.user!.uid);
    const roleData = role.toJSON ? role.toJSON() : role;

    ResponseFormatter.success(
      res,
      {
        id: roleData.id,
        roleKey: roleData.roleKey,
        name: roleData.name,
        description: roleData.description,
        hierarchyLevel: roleData.hierarchyLevel,
        parentRoleId: roleData.parentRoleId,
        companyId: roleData.companyId,
        isSystemRole: roleData.isSystemRole,
        isActive: roleData.isActive,
        permissions: roleData.permissions,
        menuAccess: roleData.menuAccess,
        canAccessAllCompanies: roleData.canAccessAllCompanies,
        canAccessMultipleCompanies: roleData.canAccessMultipleCompanies,
        canAccessSingleCompany: roleData.canAccessSingleCompany,
        canManageCompanies: roleData.canManageCompanies,
        canCreateCompanies: roleData.canCreateCompanies,
        canManageProviderStaff: roleData.canManageProviderStaff,
        canManageEmployees: roleData.canManageEmployees,
        canApproveLeaves: roleData.canApproveLeaves,
        canViewPayroll: roleData.canViewPayroll,
        createdAt: roleData.createdAt,
        updatedAt: roleData.updatedAt,
      },
      'Role created successfully',
      '',
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const getCreateRoleForm = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to view role creation form'));
    }

    // Get available parent roles (excluding system roles for custom role creation)
    const availableRoles = await RoleService.getAllRoles({
      isActive: true,
    });

    // Filter out roles that are at the maximum hierarchy level (8) as they can't be parents
    const parentRoles = availableRoles
      .filter((role) => role.hierarchyLevel < 8)
      .map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          hierarchyLevel: roleData.hierarchyLevel,
        };
      });

    ResponseFormatter.success(
      res,
      {
        hierarchyLevels: Array.from({ length: 8 }, (_, i) => i + 1),
        parentRoles,
        defaults: {
          hierarchyLevel: 1,
          isActive: true,
          permissions: {},
          menuAccess: [],
          canAccessAllCompanies: false,
          canAccessMultipleCompanies: false,
          canAccessSingleCompany: false,
          canManageCompanies: false,
          canCreateCompanies: false,
          canManageProviderStaff: false,
          canManageEmployees: false,
          canApproveLeaves: false,
          canViewPayroll: false,
        },
      },
      'Role creation form data retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getAllRolesHierarchy = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to view role hierarchy'));
    }

    // Get all roles for hierarchy display
    const allRoles = await RoleService.getAllRoles({
      isActive: true,
    });

    // Group roles by hierarchy level and format them
    const hierarchyByLevel: Record<number, any[]> = {};
    allRoles.forEach((role) => {
      const roleData = role.toJSON ? role.toJSON() : role;
      if (!hierarchyByLevel[roleData.hierarchyLevel]) {
        hierarchyByLevel[roleData.hierarchyLevel] = [];
      }
      hierarchyByLevel[roleData.hierarchyLevel].push({
        id: roleData.id,
        roleKey: roleData.roleKey,
        name: roleData.name,
        description: roleData.description,
        hierarchyLevel: roleData.hierarchyLevel,
        parentRoleId: roleData.parentRoleId,
        companyId: roleData.companyId,
        isSystemRole: roleData.isSystemRole,
        isActive: roleData.isActive,
      });
    });

    // Convert to array format with hierarchy levels
    const hierarchy = Array.from({ length: 8 }, (_, i) => {
      const level = i + 1;
      return {
        level,
        roles: hierarchyByLevel[level] || [],
      };
    });

    ResponseFormatter.success(
      res,
      {
        hierarchy,
      },
      'Role hierarchy retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getCreateRoleHierarchy = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to view role hierarchy'));
    }

    // Get all roles for hierarchy display
    const allRoles = await RoleService.getAllRoles({
      isActive: true,
    });

    // Group roles by hierarchy level and format them
    const hierarchyByLevel: Record<number, any[]> = {};
    allRoles.forEach((role) => {
      const roleData = role.toJSON ? role.toJSON() : role;
      if (!hierarchyByLevel[roleData.hierarchyLevel]) {
        hierarchyByLevel[roleData.hierarchyLevel] = [];
      }
      hierarchyByLevel[roleData.hierarchyLevel].push({
        id: roleData.id,
        roleKey: roleData.roleKey,
        name: roleData.name,
        description: roleData.description,
        hierarchyLevel: roleData.hierarchyLevel,
        parentRoleId: roleData.parentRoleId,
        companyId: roleData.companyId,
        isSystemRole: roleData.isSystemRole,
        isActive: roleData.isActive,
      });
    });

    // Convert to array format with hierarchy levels
    const hierarchy = Array.from({ length: 8 }, (_, i) => {
      const level = i + 1;
      return {
        level,
        roles: hierarchyByLevel[level] || [],
      };
    });

    ResponseFormatter.success(
      res,
      {
        hierarchy,
      },
      'Role hierarchy retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getCreateRoleChildren = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to view child roles'));
    }

    // Get all roles that could be children (i.e., roles with hierarchy level > 1)
    // In the create context, we want to show all roles that could potentially be children
    const allRoles = await RoleService.getAllRoles({
      isActive: true,
    });

    // Return all roles (they could all potentially be children depending on the parent)
    const childRoles = allRoles
      .filter((role) => role.hierarchyLevel > 1) // Exclude level 1 roles as they can't be children
      .map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
        };
      });

    ResponseFormatter.success(
      res,
      childRoles,
      'Child roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getCreateRoleParents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to view parent roles'));
    }

    // Get all roles that could be parents (i.e., roles with hierarchy level < 8)
    // Level 8 roles can't be parents as they're at the bottom of the hierarchy
    const allRoles = await RoleService.getAllRoles({
      isActive: true,
    });

    // Return all roles that could be parents (hierarchy level < 8)
    const parentRoles = allRoles
      .filter((role) => role.hierarchyLevel < 8) // Exclude level 8 roles as they can't be parents
      .map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
        };
      });

    ResponseFormatter.success(
      res,
      parentRoles,
      'Parent roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getHierarchyHierarchy = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Alias for getAllRolesHierarchy
  return getAllRolesHierarchy(req, res, next);
};

export const getHierarchyChildren = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to view child roles'));
    }

    // Get all roles that could be children (i.e., roles with hierarchy level > 1)
    const allRoles = await RoleService.getAllRoles({
      isActive: true,
    });

    const childRoles = allRoles
      .filter((role) => role.hierarchyLevel > 1)
      .map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
        };
      });

    ResponseFormatter.success(
      res,
      childRoles,
      'Child roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getHierarchyParents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to view parent roles'));
    }

    // Get all roles that could be parents (i.e., roles with hierarchy level < 8)
    const allRoles = await RoleService.getAllRoles({
      isActive: true,
    });

    const parentRoles = allRoles
      .filter((role) => role.hierarchyLevel < 8)
      .map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
        };
      });

    ResponseFormatter.success(
      res,
      parentRoles,
      'Parent roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const role = await RoleService.getRoleById(id);
    const roleData = role.toJSON ? role.toJSON() : role;

    ResponseFormatter.success(
      res,
      {
        id: roleData.id,
        roleKey: roleData.roleKey,
        name: roleData.name,
        description: roleData.description,
        hierarchyLevel: roleData.hierarchyLevel,
        parentRoleId: roleData.parentRoleId,
        companyId: roleData.companyId,
        isSystemRole: roleData.isSystemRole,
        isActive: roleData.isActive,
        permissions: roleData.permissions,
        menuAccess: roleData.menuAccess,
        canAccessAllCompanies: roleData.canAccessAllCompanies,
        canAccessMultipleCompanies: roleData.canAccessMultipleCompanies,
        canAccessSingleCompany: roleData.canAccessSingleCompany,
        canManageCompanies: roleData.canManageCompanies,
        canCreateCompanies: roleData.canCreateCompanies,
        canManageProviderStaff: roleData.canManageProviderStaff,
        canManageEmployees: roleData.canManageEmployees,
        canApproveLeaves: roleData.canApproveLeaves,
        canViewPayroll: roleData.canViewPayroll,
        createdAt: roleData.createdAt,
        updatedAt: roleData.updatedAt,
      },
      'Role retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getAllRoles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to view roles'));
    }

    const { companyId, isSystemRole, isActive, hierarchyLevel } = req.query;

    const filters: any = {};
    if (companyId) filters.companyId = companyId as string;
    if (isSystemRole !== undefined) filters.isSystemRole = isSystemRole === 'true';
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (hierarchyLevel) filters.hierarchyLevel = parseInt(hierarchyLevel as string, 10);

    const roles = await RoleService.getAllRoles(filters);

    ResponseFormatter.success(
      res,
      roles.map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
          permissions: roleData.permissions,
          menuAccess: roleData.menuAccess,
          canAccessAllCompanies: roleData.canAccessAllCompanies,
          canAccessMultipleCompanies: roleData.canAccessMultipleCompanies,
          canAccessSingleCompany: roleData.canAccessSingleCompany,
          canManageCompanies: roleData.canManageCompanies,
          canCreateCompanies: roleData.canCreateCompanies,
          canManageProviderStaff: roleData.canManageProviderStaff,
          canManageEmployees: roleData.canManageEmployees,
          canApproveLeaves: roleData.canApproveLeaves,
          canViewPayroll: roleData.canViewPayroll,
          createdAt: roleData.createdAt,
          updatedAt: roleData.updatedAt,
        };
      }),
      'Roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to update roles'));
    }

    const { id } = req.params;
    const validatedData = updateRoleSchema.parse(req.body);
    const role = await RoleService.updateRole(id, validatedData, req.user!.uid);
    const roleData = role.toJSON ? role.toJSON() : role;

    ResponseFormatter.success(
      res,
      {
        id: roleData.id,
        roleKey: roleData.roleKey,
        name: roleData.name,
        description: roleData.description,
        hierarchyLevel: roleData.hierarchyLevel,
        parentRoleId: roleData.parentRoleId,
        companyId: roleData.companyId,
        isSystemRole: roleData.isSystemRole,
        isActive: roleData.isActive,
        permissions: roleData.permissions,
        menuAccess: roleData.menuAccess,
        canAccessAllCompanies: roleData.canAccessAllCompanies,
        canAccessMultipleCompanies: roleData.canAccessMultipleCompanies,
        canAccessSingleCompany: roleData.canAccessSingleCompany,
        canManageCompanies: roleData.canManageCompanies,
        canCreateCompanies: roleData.canCreateCompanies,
        canManageProviderStaff: roleData.canManageProviderStaff,
        canManageEmployees: roleData.canManageEmployees,
        canApproveLeaves: roleData.canApproveLeaves,
        canViewPayroll: roleData.canViewPayroll,
        createdAt: roleData.createdAt,
        updatedAt: roleData.updatedAt,
      },
      'Role updated successfully'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError(error.errors[0].message));
    }
    next(error);
  }
};

export const deleteRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to delete roles'));
    }

    const { id } = req.params;
    await RoleService.deleteRole(id);

    ResponseFormatter.success(res, null, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getRoleHierarchy = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const hierarchy = await RoleService.getRoleHierarchy(id);

    ResponseFormatter.success(
      res,
      hierarchy.map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
        };
      }),
      'Role hierarchy retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getRolesByHierarchyLevel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { level } = req.params;
    const hierarchyLevel = parseInt(level, 10);

    if (isNaN(hierarchyLevel) || hierarchyLevel < 1 || hierarchyLevel > 8) {
      return next(new ValidationError('Invalid hierarchy level. Must be between 1 and 8'));
    }

    const roles = await RoleService.getRolesByHierarchyLevel(hierarchyLevel);

    ResponseFormatter.success(
      res,
      roles.map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
        isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
        };
      }),
      'Roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getChildRoles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const childRoles = await RoleService.getChildRoles(id);

    ResponseFormatter.success(
      res,
      childRoles.map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
        };
      }),
      'Child roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getParentRoles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const parentRoles = await RoleService.getParentRoles(id);

    ResponseFormatter.success(
      res,
      parentRoles.map((role) => {
        const roleData = role.toJSON ? role.toJSON() : role;
        return {
          id: roleData.id,
          roleKey: roleData.roleKey,
          name: roleData.name,
          description: roleData.description,
          hierarchyLevel: roleData.hierarchyLevel,
          parentRoleId: roleData.parentRoleId,
          companyId: roleData.companyId,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
        };
      }),
      'Parent roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const assignMenuAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to assign menu access'));
    }

    const { id } = req.params;
    const { menuIds } = req.body;

    if (!Array.isArray(menuIds)) {
      return next(new ValidationError('menuIds must be an array'));
    }

    const role = await RoleService.assignMenuAccess(id, menuIds);
    const roleData = role.toJSON ? role.toJSON() : role;

    ResponseFormatter.success(
      res,
      {
        id: roleData.id,
        menuAccess: roleData.menuAccess,
      },
      'Menu access assigned successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const updatePermissions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (![UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN].includes(userRole)) {
      return next(new ValidationError('Insufficient permissions to update permissions'));
    }

    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== 'object') {
      return next(new ValidationError('permissions must be an object'));
    }

    const role = await RoleService.updatePermissions(id, permissions);
    const roleData = role.toJSON ? role.toJSON() : role;

    ResponseFormatter.success(
      res,
      {
        id: roleData.id,
        permissions: roleData.permissions,
      },
      'Permissions updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const initializeSystemRoles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role as UserRole;
    if (userRole !== UserRole.SUPER_ADMIN) {
      return next(new ValidationError('Only super admin can initialize system roles'));
    }

    await RoleService.initializeSystemRoles();

    ResponseFormatter.success(res, null, 'System roles initialized successfully');
  } catch (error) {
    next(error);
  }
};

