import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { UserRole } from '@hrm/common';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'emailVerified' | 'phoneVerified' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public email!: string;
  public password!: string;
  public phoneNumber?: string;
  public role!: UserRole;
  public emailVerified!: boolean;
  public phoneVerified!: boolean;
  public verificationToken?: string;
  public verificationTokenExpiry?: Date;
  public resetPasswordToken?: string;
  public resetPasswordTokenExpiry?: Date;
  public lastLogin?: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM(
        'super_admin',
        'provider_admin',
        'provider_hr_staff',
        'hrbp',
        'company_admin',
        'department_head',
        'manager',
        'employee'
      ),
      allowNull: false,
      defaultValue: 'employee',
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'Users',
    indexes: [
      { fields: ['email'] },
      { fields: ['phoneNumber'] },
      { fields: ['verificationToken'] },
      { fields: ['resetPasswordToken'] },
      { fields: ['role'] },
      { fields: ['isActive'] },
    ],
  }
);

