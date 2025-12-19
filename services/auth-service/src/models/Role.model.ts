import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface RoleAttributes {
  id: string;
  roleKey: string;
  name: string;
  description?: string;
  hierarchyLevel: number;
  parentRoleId?: string;
  companyId?: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: Record<string, any>;
  menuAccess: string[];
  canAccessAllCompanies: boolean;
  canAccessMultipleCompanies: boolean;
  canAccessSingleCompany: boolean;
  canManageCompanies: boolean;
  canCreateCompanies: boolean;
  canManageProviderStaff: boolean;
  canManageEmployees: boolean;
  canApproveLeaves: boolean;
  canViewPayroll: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleCreationAttributes
  extends Optional<
    RoleAttributes,
    | 'id'
    | 'description'
    | 'parentRoleId'
    | 'companyId'
    | 'isSystemRole'
    | 'isActive'
    | 'permissions'
    | 'menuAccess'
    | 'canAccessAllCompanies'
    | 'canAccessMultipleCompanies'
    | 'canAccessSingleCompany'
    | 'canManageCompanies'
    | 'canCreateCompanies'
    | 'canManageProviderStaff'
    | 'canManageEmployees'
    | 'canApproveLeaves'
    | 'canViewPayroll'
    | 'createdBy'
    | 'updatedBy'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: string;
  public roleKey!: string;
  public name!: string;
  public description?: string;
  public hierarchyLevel!: number;
  public parentRoleId?: string;
  public companyId?: string;
  public isSystemRole!: boolean;
  public isActive!: boolean;
  public permissions!: Record<string, any>;
  public menuAccess!: string[];
  public canAccessAllCompanies!: boolean;
  public canAccessMultipleCompanies!: boolean;
  public canAccessSingleCompany!: boolean;
  public canManageCompanies!: boolean;
  public canCreateCompanies!: boolean;
  public canManageProviderStaff!: boolean;
  public canManageEmployees!: boolean;
  public canApproveLeaves!: boolean;
  public canViewPayroll!: boolean;
  public createdBy?: string;
  public updatedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roleKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hierarchyLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 8,
      },
    },
    parentRoleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Roles',
        key: 'id',
      },
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id',
      },
    },
    isSystemRole: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    menuAccess: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    canAccessAllCompanies: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canAccessMultipleCompanies: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canAccessSingleCompany: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canManageCompanies: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canCreateCompanies: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canManageProviderStaff: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canManageEmployees: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canApproveLeaves: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canViewPayroll: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'Roles',
    indexes: [
      { fields: ['roleKey'] },
      { fields: ['hierarchyLevel'] },
      { fields: ['parentRoleId'] },
      { fields: ['companyId'] },
      { fields: ['isSystemRole'] },
      { fields: ['isActive'] },
    ],
  }
);

