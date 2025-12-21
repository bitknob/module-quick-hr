import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ScheduleFrequency = 'monthly' | 'biweekly' | 'weekly' | 'custom';
export type ScheduleStatus = 'active' | 'inactive' | 'paused';
export type GenerationTrigger = 'automatic' | 'manual' | 'scheduled';

export interface PayslipGenerationScheduleAttributes {
  id: string;
  companyId: string;
  scheduleName: string;
  description?: string;
  frequency: ScheduleFrequency;
  generationDay: number;
  generationTime: string;
  timezone: string;
  triggerType: GenerationTrigger;
  autoApprove: boolean;
  autoSend: boolean;
  emailConfiguration?: any;
  notificationConfiguration?: any;
  status: ScheduleStatus;
  lastRunAt?: Date;
  nextRunAt?: Date;
  lastRunStatus?: string;
  lastRunError?: string;
  customScheduleRule?: any;
  enabledMonths?: number[];
  enabledYears?: number[];
  excludedDates?: Date[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayslipGenerationScheduleCreationAttributes
  extends Optional<PayslipGenerationScheduleAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export class PayslipGenerationSchedule
  extends Model<PayslipGenerationScheduleAttributes, PayslipGenerationScheduleCreationAttributes>
  implements PayslipGenerationScheduleAttributes
{
  public id!: string;
  public companyId!: string;
  public scheduleName!: string;
  public description?: string;
  public frequency!: ScheduleFrequency;
  public generationDay!: number;
  public generationTime!: string;
  public timezone!: string;
  public triggerType!: GenerationTrigger;
  public autoApprove!: boolean;
  public autoSend!: boolean;
  public emailConfiguration?: any;
  public notificationConfiguration?: any;
  public status!: ScheduleStatus;
  public lastRunAt?: Date;
  public nextRunAt?: Date;
  public lastRunStatus?: string;
  public lastRunError?: string;
  public customScheduleRule?: any;
  public enabledMonths?: number[];
  public enabledYears?: number[];
  public excludedDates?: Date[];
  public createdBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayslipGenerationSchedule.init(
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
    scheduleName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.ENUM('monthly', 'biweekly', 'weekly', 'custom'),
      allowNull: false,
    },
    generationDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Day of month/week (1-31 for monthly, 1-14 for biweekly, 1-7 for weekly)',
    },
    generationTime: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Time in HH:MM format (24-hour)',
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'UTC',
    },
    triggerType: {
      type: DataTypes.ENUM('automatic', 'manual', 'scheduled'),
      defaultValue: 'scheduled',
    },
    autoApprove: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    autoSend: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailConfiguration: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    notificationConfiguration: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'paused'),
      defaultValue: 'active',
    },
    lastRunAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextRunAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastRunStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastRunError: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customScheduleRule: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    enabledMonths: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      comment: 'Array of month numbers (1-12) when schedule is enabled',
    },
    enabledYears: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      comment: 'Array of years when schedule is enabled',
    },
    excludedDates: {
      type: DataTypes.ARRAY(DataTypes.DATE),
      allowNull: true,
    },
    createdBy: {
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
    tableName: 'PayslipGenerationSchedules',
    indexes: [
      { fields: ['companyId'] },
      { fields: ['status'] },
      { fields: ['frequency'] },
      { fields: ['nextRunAt'] },
      { fields: ['companyId', 'status'] },
    ],
  }
);

