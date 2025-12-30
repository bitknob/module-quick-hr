import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Employee } from './Employee.model';
import { Company } from './Company.model';

export enum NotificationType {
  LEAVE_REQUEST = 'leave_request',
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  LEAVE_CANCELLED = 'leave_cancelled',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_VERIFIED = 'document_verified',
  DOCUMENT_REJECTED = 'document_rejected',
  APPROVAL_REQUEST = 'approval_request',
  APPROVAL_APPROVED = 'approval_approved',
  APPROVAL_REJECTED = 'approval_rejected',
  ATTENDANCE_MARKED = 'attendance_marked',
  PAYSLIP_GENERATED = 'payslip_generated',
  EMPLOYEE_CREATED = 'employee_created',
  EMPLOYEE_UPDATED = 'employee_updated',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  OTHER = 'other',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  FAILED = 'failed',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
}

export interface NotificationAttributes {
  id: string;
  companyId: string;
  userId: string;
  employeeId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  readAt?: Date;
  sentAt?: Date;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'readAt' | 'sentAt'> {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string;
  public companyId!: string;
  public userId!: string;
  public employeeId?: string;
  public type!: NotificationType;
  public title!: string;
  public message!: string;
  public data?: Record<string, any>;
  public channels!: NotificationChannel[];
  public status!: NotificationStatus;
  public readAt?: Date;
  public sentAt?: Date;
  public scheduledFor?: Date;
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public employee?: Employee;
  public company?: Company;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'User ID from auth service',
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional data related to the notification (entity IDs, etc.)',
    },
    channels: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...Object.values(NotificationChannel))),
      allowNull: false,
      defaultValue: [NotificationChannel.IN_APP],
    },
    status: {
      type: DataTypes.ENUM(...Object.values(NotificationStatus)),
      defaultValue: NotificationStatus.PENDING,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Schedule notification for future delivery',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional metadata (delivery attempts, errors, etc.)',
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
    tableName: 'Notifications',
    indexes: [
      { fields: ['userId'] },
      { fields: ['companyId'] },
      { fields: ['employeeId'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
      { fields: ['readAt'] },
      { fields: ['userId', 'status'] },
      { fields: ['userId', 'readAt'] },
    ],
  }
);

Notification.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

Notification.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

