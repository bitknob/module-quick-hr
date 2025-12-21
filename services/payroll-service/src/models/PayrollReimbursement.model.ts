import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ReimbursementType = 'travel' | 'medical' | 'meal' | 'telephone' | 'internet' | 'fuel' | 'conveyance' | 'other';
export type ReimbursementStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'processed' | 'cancelled';

export interface PayrollReimbursementAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  payrollRunId?: string;
  payslipId?: string;
  reimbursementType: ReimbursementType;
  description?: string;
  claimAmount: number;
  approvedAmount: number;
  claimDate: Date;
  documents?: string[];
  expenseBreakdown?: any;
  status: ReimbursementStatus;
  approvedBy?: string;
  approvedAt?: Date;
  processedAt?: Date;
  rejectionReason?: string;
  applicableMonth: number;
  applicableYear: number;
  isTaxable: boolean;
  taxExemptionLimit?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollReimbursementCreationAttributes
  extends Optional<PayrollReimbursementAttributes, 'id' | 'status' | 'isTaxable' | 'approvedAmount' | 'createdAt' | 'updatedAt'> {}

export class PayrollReimbursement
  extends Model<PayrollReimbursementAttributes, PayrollReimbursementCreationAttributes>
  implements PayrollReimbursementAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public payrollRunId?: string;
  public payslipId?: string;
  public reimbursementType!: ReimbursementType;
  public description?: string;
  public claimAmount!: number;
  public approvedAmount!: number;
  public status!: ReimbursementStatus;
  public claimDate!: Date;
  public documents?: string[];
  public expenseBreakdown?: any;
  public approvedBy?: string;
  public approvedAt?: Date;
  public processedAt?: Date;
  public rejectionReason?: string;
  public applicableMonth!: number;
  public applicableYear!: number;
  public isTaxable!: boolean;
  public taxExemptionLimit?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayrollReimbursement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id',
      },
    },
    payrollRunId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PayrollRuns',
        key: 'id',
      },
    },
    payslipId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Payslips',
        key: 'id',
      },
    },
    reimbursementType: {
      type: DataTypes.ENUM('travel', 'medical', 'meal', 'telephone', 'internet', 'fuel', 'conveyance', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    claimAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    approvedAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    claimDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    documents: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    expenseBreakdown: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected', 'processed', 'cancelled'),
      defaultValue: 'draft',
    },
    approvedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    applicableMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    applicableYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isTaxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    taxExemptionLimit: {
      type: DataTypes.DECIMAL(10, 2),
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
    tableName: 'PayrollReimbursements',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['payrollRunId'] },
      { fields: ['payslipId'] },
      { fields: ['reimbursementType'] },
      { fields: ['status'] },
      { fields: ['applicableMonth', 'applicableYear'] },
      { fields: ['employeeId', 'status'] },
    ],
  }
);

