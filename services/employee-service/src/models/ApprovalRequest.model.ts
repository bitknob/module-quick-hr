import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Employee } from './Employee.model';
import { ApprovalStep } from './ApprovalStep.model';
import { ApprovalHistory } from './ApprovalHistory.model';
import {
  ApprovalRequestType,
  ApprovalStatus,
  ApprovalPriority,
} from '@hrm/common';

export interface ApprovalRequestAttributes {
  id: string;
  companyId: string;
  requestType: ApprovalRequestType;
  entityType: string;
  entityId?: string;
  requestedBy: string;
  requestedFor?: string;
  requestData: Record<string, any>;
  currentStep: number;
  totalSteps: number;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  expiresAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRequestCreationAttributes
  extends Optional<ApprovalRequestAttributes, 'id' | 'createdAt' | 'updatedAt' | 'currentStep' | 'totalSteps' | 'status' | 'priority'> {}

export class ApprovalRequest
  extends Model<ApprovalRequestAttributes, ApprovalRequestCreationAttributes>
  implements ApprovalRequestAttributes
{
  public id!: string;
  public companyId!: string;
  public requestType!: ApprovalRequestType;
  public entityType!: string;
  public entityId?: string;
  public requestedBy!: string;
  public requestedFor?: string;
  public requestData!: Record<string, any>;
  public currentStep!: number;
  public totalSteps!: number;
  public status!: ApprovalStatus;
  public priority!: ApprovalPriority;
  public expiresAt?: Date;
  public approvedAt?: Date;
  public rejectedAt?: Date;
  public rejectionReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApprovalRequest.init(
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
    requestType: {
      type: DataTypes.ENUM(...Object.values(ApprovalRequestType)),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    requestedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    requestedFor: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    requestData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    currentStep: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    totalSteps: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ApprovalStatus)),
      defaultValue: ApprovalStatus.PENDING,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(ApprovalPriority)),
      defaultValue: ApprovalPriority.NORMAL,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'ApprovalRequests',
    timestamps: true,
  }
);

ApprovalRequest.belongsTo(Employee, {
  foreignKey: 'requestedBy',
  as: 'requestedByEmployee',
});

ApprovalRequest.belongsTo(Employee, {
  foreignKey: 'requestedFor',
  as: 'requestedForEmployee',
});

ApprovalRequest.hasMany(ApprovalStep, {
  foreignKey: 'approvalRequestId',
  as: 'steps',
});

ApprovalRequest.hasMany(ApprovalHistory, {
  foreignKey: 'approvalRequestId',
  as: 'history',
});

