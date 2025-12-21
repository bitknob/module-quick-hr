import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { PayrollRun } from './PayrollRun.model';

export type PayslipStatus = 'draft' | 'generated' | 'approved' | 'sent' | 'downloaded';

export interface PayslipAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  payrollRunId: string;
  payslipNumber: string;
  month: number;
  year: number;
  status: PayslipStatus;
  
  ctc: number;
  grossSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  
  earningsBreakdown: any;
  deductionsBreakdown: any;
  
  tdsAmount: number;
  professionalTaxAmount: number;
  epfEmployeeAmount: number;
  epfEmployerAmount: number;
  esiEmployeeAmount: number;
  esiEmployerAmount: number;
  
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  
  variablePayTotal: number;
  arrearsTotal: number;
  reimbursementTotal: number;
  loanDeductionTotal: number;
  
  proRataDays: number;
  proRataFactor: number;
  lossOfPayDays: number;
  lossOfPayAmount: number;
  
  variablePayBreakdown: any;
  arrearsBreakdown: any;
  reimbursementBreakdown: any;
  loanDeductionBreakdown: any;
  
  taxExemptions: any;
  taxableIncome: number;
  
  ytdGrossSalary: number;
  ytdDeductions: number;
  ytdNetSalary: number;
  ytdTaxDeducted: number;
  
  templateId?: string;
  generatedPdfPath?: string;
  generatedPdfUrl?: string;
  pdfGeneratedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  sentAt?: Date;
  emailSentAt?: Date;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayslipCreationAttributes
  extends Optional<PayslipAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export class Payslip
  extends Model<PayslipAttributes, PayslipCreationAttributes>
  implements PayslipAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public payrollRunId!: string;
  public payslipNumber!: string;
  public month!: number;
  public year!: number;
  public status!: PayslipStatus;
  
  public ctc!: number;
  public grossSalary!: number;
  public totalEarnings!: number;
  public totalDeductions!: number;
  public netSalary!: number;
  
  public earningsBreakdown!: any;
  public deductionsBreakdown!: any;
  
  public tdsAmount!: number;
  public professionalTaxAmount!: number;
  public epfEmployeeAmount!: number;
  public epfEmployerAmount!: number;
  public esiEmployeeAmount!: number;
  public esiEmployerAmount!: number;
  
  public workingDays!: number;
  public presentDays!: number;
  public absentDays!: number;
  public leaveDays!: number;
  
  public variablePayTotal!: number;
  public arrearsTotal!: number;
  public reimbursementTotal!: number;
  public loanDeductionTotal!: number;
  
  public proRataDays!: number;
  public proRataFactor!: number;
  public lossOfPayDays!: number;
  public lossOfPayAmount!: number;
  
  public variablePayBreakdown!: any;
  public arrearsBreakdown!: any;
  public reimbursementBreakdown!: any;
  public loanDeductionBreakdown!: any;
  
  public taxExemptions!: any;
  public taxableIncome!: number;
  
  public ytdGrossSalary!: number;
  public ytdDeductions!: number;
  public ytdNetSalary!: number;
  public ytdTaxDeducted!: number;
  
  public templateId?: string;
  public generatedPdfPath?: string;
  public generatedPdfUrl?: string;
  public pdfGeneratedAt?: Date;
  public approvedBy?: string;
  public approvedAt?: Date;
  public sentAt?: Date;
  public emailSentAt?: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public payrollRun?: PayrollRun;
}

Payslip.init(
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
      allowNull: false,
      references: {
        model: 'PayrollRuns',
        key: 'id',
      },
    },
    payslipNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'generated', 'approved', 'sent', 'downloaded'),
      defaultValue: 'draft',
    },
    ctc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    grossSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    netSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    earningsBreakdown: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    deductionsBreakdown: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    tdsAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    professionalTaxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    epfEmployeeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    epfEmployerAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    esiEmployeeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    esiEmployerAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    workingDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    presentDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    absentDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    leaveDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    variablePayTotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    arrearsTotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    reimbursementTotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    loanDeductionTotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    proRataDays: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    proRataFactor: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 1.0,
    },
    lossOfPayDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lossOfPayAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    variablePayBreakdown: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    arrearsBreakdown: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    reimbursementBreakdown: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    loanDeductionBreakdown: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    taxExemptions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    taxableIncome: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    ytdGrossSalary: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    ytdDeductions: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    ytdNetSalary: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    ytdTaxDeducted: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PayslipTemplates',
        key: 'id',
      },
    },
    generatedPdfPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    generatedPdfUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pdfGeneratedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emailSentAt: {
      type: DataTypes.DATE,
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
    tableName: 'Payslips',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['payrollRunId'] },
      { fields: ['payslipNumber'], unique: true },
      { fields: ['employeeId', 'month', 'year'] },
      { fields: ['status'] },
      { fields: ['month', 'year'] },
    ],
  }
);

// Associations are defined in index.ts to avoid circular dependencies

