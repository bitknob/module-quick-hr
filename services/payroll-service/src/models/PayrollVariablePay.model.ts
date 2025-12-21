import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type VariablePayType = 'bonus' | 'incentive' | 'commission' | 'overtime' | 'shift_allowance' | 'performance_bonus' | 'retention_bonus' | 'other';
export type VariablePayStatus = 'draft' | 'approved' | 'processed' | 'rejected' | 'cancelled';

export interface PayrollVariablePayAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  payrollRunId?: string;
  payslipId?: string;
  variablePayType: VariablePayType;
  description?: string;
  amount: number;
  calculationBasis?: string;
  calculationDetails?: any;
  applicableMonth: number;
  applicableYear: number;
  status: VariablePayStatus;
  approvedBy?: string;
  approvedAt?: Date;
  processedAt?: Date;
  isTaxable: boolean;
  isRecurring: boolean;
  recurrenceRule?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollVariablePayCreationAttributes
  extends Optional<PayrollVariablePayAttributes, 'id' | 'status' | 'isTaxable' | 'isRecurring' | 'createdAt' | 'updatedAt'> {}

export class PayrollVariablePay
  extends Model<PayrollVariablePayAttributes, PayrollVariablePayCreationAttributes>
  implements PayrollVariablePayAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public payrollRunId?: string;
  public payslipId?: string;
  public variablePayType!: VariablePayType;
  public description?: string;
  public amount!: number;
  public calculationBasis?: string;
  public calculationDetails?: any;
  public applicableMonth!: number;
  public applicableYear!: number;
  public status!: VariablePayStatus;
  public approvedBy?: string;
  public approvedAt?: Date;
  public processedAt?: Date;
  public isTaxable!: boolean;
  public isRecurring!: boolean;
  public recurrenceRule?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayrollVariablePay.init(
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
    variablePayType: {
      type: DataTypes.ENUM('bonus', 'incentive', 'commission', 'overtime', 'shift_allowance', 'performance_bonus', 'retention_bonus', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    calculationBasis: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    calculationDetails: {
      type: DataTypes.JSONB,
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
    status: {
      type: DataTypes.ENUM('draft', 'approved', 'processed', 'rejected', 'cancelled'),
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
    isTaxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurrenceRule: {
      type: DataTypes.JSONB,
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
    tableName: 'PayrollVariablePay',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['payrollRunId'] },
      { fields: ['payslipId'] },
      { fields: ['variablePayType'] },
      { fields: ['applicableMonth', 'applicableYear'] },
      { fields: ['status'] },
      { fields: ['employeeId', 'applicableMonth', 'applicableYear'] },
    ],
  }
);

