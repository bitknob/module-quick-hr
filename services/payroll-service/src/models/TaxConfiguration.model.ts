import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TaxConfigurationAttributes {
  id: string;
  companyId: string;
  country: string;
  state: string;
  province?: string;
  financialYear: string;
  incomeTaxEnabled: boolean;
  incomeTaxSlabs: any;
  socialSecurityEnabled: boolean;
  socialSecurityEmployerRate: number;
  socialSecurityEmployeeRate: number;
  socialSecurityMaxSalary: number;
  healthInsuranceEnabled: boolean;
  healthInsuranceEmployerRate: number;
  healthInsuranceEmployeeRate: number;
  healthInsuranceMaxSalary: number;
  localTaxEnabled: boolean;
  localTaxSlabs: any;
  professionalTaxEnabled: boolean;
  professionalTaxSlabs: any;
  housingAllowanceExemptionRules: any;
  travelAllowanceExemptionRules: any;
  standardDeduction: number;
  taxExemptions: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaxConfigurationCreationAttributes
  extends Optional<TaxConfigurationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class TaxConfiguration
  extends Model<TaxConfigurationAttributes, TaxConfigurationCreationAttributes>
  implements TaxConfigurationAttributes
{
  public id!: string;
  public companyId!: string;
  public country!: string;
  public state!: string;
  public province?: string;
  public financialYear!: string;
  public incomeTaxEnabled!: boolean;
  public incomeTaxSlabs!: any;
  public socialSecurityEnabled!: boolean;
  public socialSecurityEmployerRate!: number;
  public socialSecurityEmployeeRate!: number;
  public socialSecurityMaxSalary!: number;
  public healthInsuranceEnabled!: boolean;
  public healthInsuranceEmployerRate!: number;
  public healthInsuranceEmployeeRate!: number;
  public healthInsuranceMaxSalary!: number;
  public localTaxEnabled!: boolean;
  public localTaxSlabs!: any;
  public professionalTaxEnabled!: boolean;
  public professionalTaxSlabs!: any;
  public housingAllowanceExemptionRules!: any;
  public travelAllowanceExemptionRules!: any;
  public standardDeduction!: number;
  public taxExemptions!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TaxConfiguration.init(
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
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'IN',
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    financialYear: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    incomeTaxEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    incomeTaxSlabs: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    socialSecurityEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    socialSecurityEmployerRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    socialSecurityEmployeeRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    socialSecurityMaxSalary: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    healthInsuranceEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    healthInsuranceEmployerRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    healthInsuranceEmployeeRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    healthInsuranceMaxSalary: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    localTaxEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    localTaxSlabs: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    professionalTaxEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    professionalTaxSlabs: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    housingAllowanceExemptionRules: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    travelAllowanceExemptionRules: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    standardDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    taxExemptions: {
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
    tableName: 'TaxConfigurations',
    indexes: [
      { fields: ['companyId'] },
      { fields: ['companyId', 'country', 'financialYear'], unique: true },
      { fields: ['country'] },
      { fields: ['state'] },
    ],
  }
);

