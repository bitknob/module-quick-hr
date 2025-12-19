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

    ResponseFormatter.success(
      res,
      {
        id: role.id,
        roleKey: role.roleKey,
        name: role.name,
        description: role.description,
        hierarchyLevel: role.hierarchyLevel,
        parentRoleId: role.parentRoleId,
        companyId: role.companyId,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
        permissions: role.permissions,
        menuAccess: role.menuAccess,
        canAccessAllCompanies: role.canAccessAllCompanies,
        canAccessMultipleCompanies: role.canAccessMultipleCompanies,
        canAccessSingleCompany: role.canAccessSingleCompany,
        canManageCompanies: role.canManageCompanies,
        canCreateCompanies: role.canCreateCompanies,
        canManageProviderStaff: role.canManageProviderStaff,
        canManageEmployees: role.canManageEmployees,
        canApproveLeaves: role.canApproveLeaves,
        canViewPayroll: role.canViewPayroll,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
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

export const getRoleById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const role = await RoleService.getRoleById(id);

    ResponseFormatter.success(
      res,
      {
        id: role.id,
        roleKey: role.roleKey,
        name: role.name,
        description: role.description,
        hierarchyLevel: role.hierarchyLevel,
        parentRoleId: role.parentRoleId,
        companyId: role.companyId,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
        permissions: role.permissions,
        menuAccess: role.menuAccess,
        canAccessAllCompanies: role.canAccessAllCompanies,
        canAccessMultipleCompanies: role.canAccessMultipleCompanies,
        canAccessSingleCompany: role.canAccessSingleCompany,
        canManageCompanies: role.canManageCompanies,
        canCreateCompanies: role.canCreateCompanies,
        canManageProviderStaff: role.canManageProviderStaff,
        canManageEmployees: role.canManageEmployees,
        canApproveLeaves: role.canApproveLeaves,
        canViewPayroll: role.canViewPayroll,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
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
      roles.map((role) => ({
        id: role.id,
        roleKey: role.roleKey,
        name: role.name,
        description: role.description,
        hierarchyLevel: role.hierarchyLevel,
        parentRoleId: role.parentRoleId,
        companyId: role.companyId,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
        permissions: role.permissions,
        menuAccess: role.menuAccess,
        canAccessAllCompanies: role.canAccessAllCompanies,
        canAccessMultipleCompanies: role.canAccessMultipleCompanies,
        canAccessSingleCompany: role.canAccessSingleCompany,
        canManageCompanies: role.canManageCompanies,
        canCreateCompanies: role.canCreateCompanies,
        canManageProviderStaff: role.canManageProviderStaff,
        canManageEmployees: role.canManageEmployees,
        canApproveLeaves: role.canApproveLeaves,
        canViewPayroll: role.canViewPayroll,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
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

    ResponseFormatter.success(
      res,
      {
        id: role.id,
        roleKey: role.roleKey,
        name: role.name,
        description: role.description,
        hierarchyLevel: role.hierarchyLevel,
        parentRoleId: role.parentRoleId,
        companyId: role.companyId,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
        permissions: role.permissions,
        menuAccess: role.menuAccess,
        canAccessAllCompanies: role.canAccessAllCompanies,
        canAccessMultipleCompanies: role.canAccessMultipleCompanies,
        canAccessSingleCompany: role.canAccessSingleCompany,
        canManageCompanies: role.canManageCompanies,
        canCreateCompanies: role.canCreateCompanies,
        canManageProviderStaff: role.canManageProviderStaff,
        canManageEmployees: role.canManageEmployees,
        canApproveLeaves: role.canApproveLeaves,
        canViewPayroll: role.canViewPayroll,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
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
      hierarchy.map((role) => ({
        id: role.id,
        roleKey: role.roleKey,
        name: role.name,
        description: role.description,
        hierarchyLevel: role.hierarchyLevel,
        parentRoleId: role.parentRoleId,
        companyId: role.companyId,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
      })),
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
      roles.map((role) => ({
        id: role.id,
        roleKey: role.roleKey,
        name: role.name,
        description: role.description,
        hierarchyLevel: role.hierarchyLevel,
        parentRoleId: role.parentRoleId,
        companyId: role.companyId,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
      })),
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
      childRoles.map((role) => ({
        id: role.id,
        roleKey: role.roleKey,
        name: role.name,
        description: role.description,
        hierarchyLevel: role.hierarchyLevel,
        parentRoleId: role.parentRoleId,
        companyId: role.companyId,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
      })),
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
      parentRoles.map((role) => ({
        id: role.id,
        roleKey: role.roleKey,
        name: role.name,
        description: role.description,
        hierarchyLevel: role.hierarchyLevel,
        parentRoleId: role.parentRoleId,
        companyId: role.companyId,
        isSystemRole: role.isSystemRole,
        isActive: role.isActive,
      })),
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

    ResponseFormatter.success(
      res,
      {
        id: role.id,
        menuAccess: role.menuAccess,
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

    ResponseFormatter.success(
      res,
      {
        id: role.id,
        permissions: role.permissions,
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

