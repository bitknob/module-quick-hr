import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type TemplateType = 'standard' | 'minimal' | 'detailed' | 'custom';
export type TemplateStatus = 'draft' | 'active' | 'inactive';

export interface PayslipTemplateAttributes {
  id: string;
  companyId: string;
  templateName: string;
  templateType: TemplateType;
  description?: string;
  status: TemplateStatus;
  headerConfiguration: any;
  footerConfiguration: any;
  bodyConfiguration: any;
  stylingConfiguration: any;
  sectionsConfiguration: any;
  watermarkSettings?: any;
  brandingSettings?: any;
  isDefault: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayslipTemplateCreationAttributes
  extends Optional<PayslipTemplateAttributes, 'id' | 'status' | 'isDefault' | 'createdAt' | 'updatedAt'> {}

export class PayslipTemplate
  extends Model<PayslipTemplateAttributes, PayslipTemplateCreationAttributes>
  implements PayslipTemplateAttributes
{
  public id!: string;
  public companyId!: string;
  public templateName!: string;
  public templateType!: TemplateType;
  public description?: string;
  public status!: TemplateStatus;
  public headerConfiguration!: any;
  public footerConfiguration!: any;
  public bodyConfiguration!: any;
  public stylingConfiguration!: any;
  public sectionsConfiguration!: any;
  public watermarkSettings?: any;
  public brandingSettings?: any;
  public isDefault!: boolean;
  public createdBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PayslipTemplate.init(
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
    templateName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    templateType: {
      type: DataTypes.ENUM('standard', 'minimal', 'detailed', 'custom'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      defaultValue: 'draft',
    },
    headerConfiguration: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    footerConfiguration: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    bodyConfiguration: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    stylingConfiguration: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    sectionsConfiguration: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    watermarkSettings: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    brandingSettings: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'PayslipTemplates',
    indexes: [
      { fields: ['companyId'] },
      { fields: ['status'] },
      { fields: ['templateType'] },
      { fields: ['isDefault'] },
      { fields: ['companyId', 'status'] },
    ],
  }
);

