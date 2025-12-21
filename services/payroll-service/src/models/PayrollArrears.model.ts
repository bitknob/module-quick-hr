import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ArrearsType = 'salary_revision' | 'promotion' | 'retroactive_adjustment' | 'correction' | 'bonus_arrears' | 'allowance_adjustment' | 'other';
export type ArrearsStatus = 'pending' | 'approved' | 'processed' | 'cancelled';

export interface PayrollArrearsAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  payrollRunId?: string;
  payslipId?: string;
  arrearsType: ArrearsType;
  description?: string;
  originalPeriodFrom: Date;
  originalPeriodTo: Date;
  adjustmentAmount: number;
  breakdown?: any;
  reason?: string;
  status: ArrearsStatus;
  approvedBy?: string;
  approvedAt?: Date;
  processedAt?: Date;
  applicableMonth: number;
  applicableYear: number;
  isTaxable: boolean;
  taxCalculationBasis?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollArrearsCreationAttributes
  extends Optional<PayrollArrearsAttributes, 'id' | 'status' | 'isTaxable' | 'createdAt' | 'updatedAt'> {}

export class PayrollArrears
  extends Model<PayrollArrearsAttributes, PayrollArrearsCreationAttributes>
  implements PayrollArrearsAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public payrollRunId?: string;
  public payslipId?: string;
  public arrearsType!: ArrearsType;
  public description?: string;
  public originalPeriodFrom!: Date;
  public originalPeriodTo!: Date;
  public adjustmentAmount!: number;
  public breakdown?: any;
  public reason?: string;
  public status!: ArrearsStatus;
  public approvedBy?: string;
  public approvedAt?: Date;
  public processedAt?: Date;
  public applicableMonth!: number;
  public applicableYear!: number;
  public isTaxable!: boolean;
  public taxCalculationBasis?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayrollArrears.init(
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
    arrearsType: {
      type: DataTypes.ENUM('salary_revision', 'promotion', 'retroactive_adjustment', 'correction', 'bonus_arrears', 'allowance_adjustment', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    originalPeriodFrom: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    originalPeriodTo: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    adjustmentAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    breakdown: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'processed', 'cancelled'),
      defaultValue: 'pending',
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
      defaultValue: true,
    },
    taxCalculationBasis: {
      type: DataTypes.STRING,
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
    tableName: 'PayrollArrears',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['payrollRunId'] },
      { fields: ['payslipId'] },
      { fields: ['arrearsType'] },
      { fields: ['status'] },
      { fields: ['applicableMonth', 'applicableYear'] },
      { fields: ['employeeId', 'status'] },
    ],
  }
);

