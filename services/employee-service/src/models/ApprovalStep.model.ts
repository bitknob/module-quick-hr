import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ApproverType, ApprovalStepStatus } from '@hrm/common';

export interface ApprovalStepAttributes {
  id: string;
  approvalRequestId: string;
  stepNumber: number;
  approverId?: string;
  approverRole?: string;
  approverType: ApproverType;
  status: ApprovalStepStatus;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  comments?: string;
  isRequired: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStepCreationAttributes
  extends Optional<
    ApprovalStepAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'status' | 'isRequired'
  > {}

export class ApprovalStep
  extends Model<ApprovalStepAttributes, ApprovalStepCreationAttributes>
  implements ApprovalStepAttributes
{
  public id!: string;
  public approvalRequestId!: string;
  public stepNumber!: number;
  public approverId?: string;
  public approverRole?: string;
  public approverType!: ApproverType;
  public status!: ApprovalStepStatus;
  public approvedAt?: Date;
  public rejectedAt?: Date;
  public rejectionReason?: string;
  public comments?: string;
  public isRequired!: boolean;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApprovalStep.init(
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
    stepNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    approverRole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approverType: {
      type: DataTypes.ENUM(...Object.values(ApproverType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ApprovalStepStatus)),
      defaultValue: ApprovalStepStatus.PENDING,
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
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: 'ApprovalSteps',
    timestamps: true,
  }
);
