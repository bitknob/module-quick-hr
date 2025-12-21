import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type GenerationStatus = 'initiated' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type GenerationSource = 'manual' | 'scheduled' | 'api' | 'bulk';

export interface PayslipGenerationLogAttributes {
  id: string;
  companyId: string;
  scheduleId?: string;
  payrollRunId?: string;
  generationSource: GenerationSource;
  status: GenerationStatus;
  month: number;
  year: number;
  totalEmployees: number;
  successfulGenerations: number;
  failedGenerations: number;
  skippedGenerations: number;
  startedAt: Date;
  completedAt?: Date;
  errorDetails?: any;
  generationConfig?: any;
  templateId?: string;
  initiatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayslipGenerationLogCreationAttributes
  extends Optional<PayslipGenerationLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PayslipGenerationLog
  extends Model<PayslipGenerationLogAttributes, PayslipGenerationLogCreationAttributes>
  implements PayslipGenerationLogAttributes
{
  public id!: string;
  public companyId!: string;
  public scheduleId?: string;
  public payrollRunId?: string;
  public generationSource!: GenerationSource;
  public status!: GenerationStatus;
  public month!: number;
  public year!: number;
  public totalEmployees!: number;
  public successfulGenerations!: number;
  public failedGenerations!: number;
  public skippedGenerations!: number;
  public startedAt!: Date;
  public completedAt?: Date;
  public errorDetails?: any;
  public generationConfig?: any;
  public templateId?: string;
  public initiatedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayslipGenerationLog.init(
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
    scheduleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PayslipGenerationSchedules',
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
    generationSource: {
      type: DataTypes.ENUM('manual', 'scheduled', 'api', 'bulk'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('initiated', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'initiated',
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
    totalEmployees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    successfulGenerations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failedGenerations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    skippedGenerations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    errorDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    generationConfig: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PayslipTemplates',
        key: 'id',
      },
    },
    initiatedBy: {
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
    tableName: 'PayslipGenerationLogs',
    indexes: [
      { fields: ['companyId'] },
      { fields: ['scheduleId'] },
      { fields: ['payrollRunId'] },
      { fields: ['status'] },
      { fields: ['month', 'year'] },
      { fields: ['generationSource'] },
      { fields: ['startedAt'] },
    ],
  }
);

