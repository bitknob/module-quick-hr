import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User.model';
import { DeviceType } from '@hrm/common';

export interface UserDeviceAttributes {
  id: string;
  userId: string;
  deviceId: string;
  deviceType: DeviceType;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  fcmToken?: string;
  apnsToken?: string;
  isActive: boolean;
  lastActiveAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDeviceCreationAttributes
  extends Optional<UserDeviceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isPrimary' | 'lastActiveAt'> {}

export class UserDevice
  extends Model<UserDeviceAttributes, UserDeviceCreationAttributes>
  implements UserDeviceAttributes
{
  public id!: string;
  public userId!: string;
  public deviceId!: string;
  public deviceType!: DeviceType;
  public deviceName?: string;
  public deviceModel?: string;
  public osVersion?: string;
  public appVersion?: string;
  public fcmToken?: string;
  public apnsToken?: string;
  public isActive!: boolean;
  public lastActiveAt?: Date;
  public ipAddress?: string;
  public userAgent?: string;
  public isPrimary!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserDevice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deviceType: {
      type: DataTypes.ENUM(...Object.values(DeviceType)),
      allowNull: false,
    },
    deviceName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deviceModel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    osVersion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    appVersion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fcmToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    apnsToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'UserDevices',
    indexes: [
      { fields: ['userId'] },
      { fields: ['deviceId'] },
      { fields: ['fcmToken'] },
      { fields: ['isActive'] },
      { unique: true, fields: ['userId', 'deviceId'] },
    ],
  }
);

UserDevice.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(UserDevice, {
  foreignKey: 'userId',
  as: 'devices',
});

