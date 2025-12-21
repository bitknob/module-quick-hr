import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PayrollRunStatus = 'draft' | 'processing' | 'completed' | 'failed' | 'locked';

export interface PayrollRunAttributes {
  id: string;
  companyId: string;
  payrollMonth: number;
  payrollYear: number;
  status: PayrollRunStatus;
  processedBy?: string;
  processedAt?: Date;
  totalEmployees: number;
  processedEmployees: number;
  failedEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  notes?: string;
  lockedAt?: Date;
  lockedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollRunCreationAttributes
  extends Optional<PayrollRunAttributes, 'id' | 'status' | 'processedEmployees' | 'failedEmployees' | 'createdAt' | 'updatedAt'> {}

export class PayrollRun
  extends Model<PayrollRunAttributes, PayrollRunCreationAttributes>
  implements PayrollRunAttributes
{
  public id!: string;
  public companyId!: string;
  public payrollMonth!: number;
  public payrollYear!: number;
  public status!: PayrollRunStatus;
  public processedBy?: string;
  public processedAt?: Date;
  public totalEmployees!: number;
  public processedEmployees!: number;
  public failedEmployees!: number;
  public totalGrossSalary!: number;
  public totalDeductions!: number;
  public totalNetSalary!: number;
  public notes?: string;
  public lockedAt?: Date;
  public lockedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayrollRun.init(
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
    payrollMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    payrollYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'processing', 'completed', 'failed', 'locked'),
      defaultValue: 'draft',
    },
    processedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totalEmployees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    processedEmployees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failedEmployees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalGrossSalary: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    totalNetSalary: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lockedBy: {
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
    tableName: 'PayrollRuns',
    indexes: [
      { fields: ['companyId'] },
      { fields: ['companyId', 'payrollMonth', 'payrollYear'], unique: true },
      { fields: ['status'] },
      { fields: ['payrollMonth', 'payrollYear'] },
    ],
  }
);

