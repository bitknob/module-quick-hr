import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Employee } from './Employee.model';
import { ApprovalRequest } from './ApprovalRequest.model';
import { ApprovalStep } from './ApprovalStep.model';
import {
  ApprovalAction,
} from '@hrm/common';

export interface ApprovalHistoryAttributes {
  id: string;
  approvalRequestId: string;
  approvalStepId?: string;
  action: ApprovalAction;
  performedBy: string;
  performedByRole?: string;
  comments?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ApprovalHistoryCreationAttributes
  extends Optional<ApprovalHistoryAttributes, 'id' | 'createdAt' | 'metadata'> {}

export class ApprovalHistory
  extends Model<ApprovalHistoryAttributes, ApprovalHistoryCreationAttributes>
  implements ApprovalHistoryAttributes
{
  public id!: string;
  public approvalRequestId!: string;
  public approvalStepId?: string;
  public action!: ApprovalAction;
  public performedBy!: string;
  public performedByRole?: string;
  public comments?: string;
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
}

ApprovalHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    approvalRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ApprovalRequests',
        key: 'id',
      },
    },
    approvalStepId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'ApprovalSteps',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM(...Object.values(ApprovalAction)),
      allowNull: false,
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    performedByRole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'ApprovalHistory',
    timestamps: false,
  }
);

ApprovalHistory.belongsTo(ApprovalRequest, {
  foreignKey: 'approvalRequestId',
  as: 'approvalRequest',
});

ApprovalHistory.belongsTo(ApprovalStep, {
  foreignKey: 'approvalStepId',
  as: 'approvalStep',
});

ApprovalHistory.belongsTo(Employee, {
  foreignKey: 'performedBy',
  as: 'performedByEmployee',
});

