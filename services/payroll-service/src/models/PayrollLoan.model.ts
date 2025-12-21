import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type LoanType = 'personal_loan' | 'advance_salary' | 'home_loan' | 'vehicle_loan' | 'education_loan' | 'medical_loan' | 'other';
export type LoanStatus = 'active' | 'closed' | 'cancelled' | 'suspended';

export interface PayrollLoanAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  loanType: LoanType;
  loanName?: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: Date;
  endDate: Date;
  status: LoanStatus;
  outstandingPrincipal: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  deductionStartMonth: number;
  deductionStartYear: number;
  repaymentSchedule?: any;
  loanTerms?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollLoanCreationAttributes
  extends Optional<PayrollLoanAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export class PayrollLoan
  extends Model<PayrollLoanAttributes, PayrollLoanCreationAttributes>
  implements PayrollLoanAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public loanType!: LoanType;
  public loanName?: string;
  public principalAmount!: number;
  public interestRate!: number;
  public tenureMonths!: number;
  public emiAmount!: number;
  public startDate!: Date;
  public endDate!: Date;
  public status!: LoanStatus;
  public outstandingPrincipal!: number;
  public totalInterestPaid!: number;
  public totalAmountPaid!: number;
  public deductionStartMonth!: number;
  public deductionStartYear!: number;
  public repaymentSchedule?: any;
  public loanTerms?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayrollLoan.init(
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
    loanType: {
      type: DataTypes.ENUM('personal_loan', 'advance_salary', 'home_loan', 'vehicle_loan', 'education_loan', 'medical_loan', 'other'),
      allowNull: false,
    },
    loanName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    principalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    tenureMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    emiAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'cancelled', 'suspended'),
      defaultValue: 'active',
    },
    outstandingPrincipal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    totalInterestPaid: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    totalAmountPaid: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    deductionStartMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    deductionStartYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    repaymentSchedule: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    loanTerms: {
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
    tableName: 'PayrollLoans',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['loanType'] },
      { fields: ['status'] },
      { fields: ['startDate', 'endDate'] },
    ],
  }
);

