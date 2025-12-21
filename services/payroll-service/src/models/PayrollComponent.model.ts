import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { SalaryStructure } from './SalaryStructure.model';

export type ComponentType = 'earning' | 'deduction';
export type ComponentCategory =
  | 'basic'
  | 'hra'
  | 'lta'
  | 'special_allowance'
  | 'transport_allowance'
  | 'medical_allowance'
  | 'bonus'
  | 'overtime'
  | 'incentive'
  | 'tds'
  | 'professional_tax'
  | 'epf'
  | 'esi'
  | 'loan'
  | 'advance'
  | 'other';

export interface PayrollComponentAttributes {
  id: string;
  salaryStructureId: string;
  componentName: string;
  componentType: ComponentType;
  componentCategory: ComponentCategory;
  isPercentage: boolean;
  value: number;
  percentageOf?: string;
  isTaxable: boolean;
  isStatutory: boolean;
  priority: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollComponentCreationAttributes
  extends Optional<PayrollComponentAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class PayrollComponent
  extends Model<PayrollComponentAttributes, PayrollComponentCreationAttributes>
  implements PayrollComponentAttributes
{
  public id!: string;
  public salaryStructureId!: string;
  public componentName!: string;
  public componentType!: ComponentType;
  public componentCategory!: ComponentCategory;
  public isPercentage!: boolean;
  public value!: number;
  public percentageOf?: string;
  public isTaxable!: boolean;
  public isStatutory!: boolean;
  public priority!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public salaryStructure?: SalaryStructure;
}

PayrollComponent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    salaryStructureId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'SalaryStructures',
        key: 'id',
      },
    },
    componentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    componentType: {
      type: DataTypes.ENUM('earning', 'deduction'),
      allowNull: false,
    },
    componentCategory: {
      type: DataTypes.ENUM(
        'basic',
        'hra',
        'lta',
        'special_allowance',
        'transport_allowance',
        'medical_allowance',
        'bonus',
        'overtime',
        'incentive',
        'tds',
        'professional_tax',
        'epf',
        'esi',
        'loan',
        'advance',
        'other'
      ),
      allowNull: false,
    },
    isPercentage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    percentageOf: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isTaxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isStatutory: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'PayrollComponents',
    indexes: [
      { fields: ['salaryStructureId'] },
      { fields: ['componentType'] },
      { fields: ['componentCategory'] },
      { fields: ['isActive'] },
    ],
  }
);

// Associations are defined in index.ts to avoid circular dependencies

