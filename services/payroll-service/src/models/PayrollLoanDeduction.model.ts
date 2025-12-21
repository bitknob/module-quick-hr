import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PayrollLoanDeductionAttributes {
  id: string;
  loanId: string;
  employeeId: string;
  companyId: string;
  payrollRunId: string;
  payslipId: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  deductionMonth: number;
  deductionYear: number;
  outstandingBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollLoanDeductionCreationAttributes
  extends Optional<PayrollLoanDeductionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PayrollLoanDeduction
  extends Model<PayrollLoanDeductionAttributes, PayrollLoanDeductionCreationAttributes>
  implements PayrollLoanDeductionAttributes
{
  public id!: string;
  public loanId!: string;
  public employeeId!: string;
  public companyId!: string;
  public payrollRunId!: string;
  public payslipId!: string;
  public emiAmount!: number;
  public principalComponent!: number;
  public interestComponent!: number;
  public deductionMonth!: number;
  public deductionYear!: number;
  public outstandingBalance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayrollLoanDeduction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    loanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'PayrollLoans',
        key: 'id',
      },
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
      allowNull: false,
      references: {
        model: 'PayrollRuns',
        key: 'id',
      },
    },
    payslipId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Payslips',
        key: 'id',
      },
    },
    emiAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    principalComponent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    interestComponent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deductionMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    deductionYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    outstandingBalance: {
      type: DataTypes.DECIMAL(12, 2),
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
    tableName: 'PayrollLoanDeductions',
    indexes: [
      { fields: ['loanId'] },
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['payrollRunId'] },
      { fields: ['payslipId'] },
      { fields: ['deductionMonth', 'deductionYear'] },
      { fields: ['loanId', 'deductionMonth', 'deductionYear'], unique: true },
    ],
  }
);

// Associations are defined in index.ts to avoid circular dependencies

