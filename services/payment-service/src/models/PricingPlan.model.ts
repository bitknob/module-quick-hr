import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PricingPlanFeature {
  name: string;
  included: boolean;
}

export interface PricingPlanAttributes {
  id: number;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PricingPlanFeature[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingPlanCreationAttributes
  extends Optional<PricingPlanAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PricingPlan
  extends Model<PricingPlanAttributes, PricingPlanCreationAttributes>
  implements PricingPlanAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;
  public monthlyPrice!: number;
  public yearlyPrice!: number;
  public features!: PricingPlanFeature[];
  public isActive!: boolean;
  public sortOrder!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public readonly toJSON = () => {
    const values = { ...this.get() };
    return {
      id: values.id,
      name: values.name,
      description: values.description,
      monthlyPrice: Number(values.monthlyPrice),
      yearlyPrice: Number(values.yearlyPrice),
      features: values.features,
      isActive: values.isActive,
      sortOrder: values.sortOrder,
      createdAt: values.createdAt,
      updatedAt: values.updatedAt,
    };
  };
}

PricingPlan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    monthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'monthly_price',
    },
    yearlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'yearly_price',
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'features',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'PricingPlan',
    tableName: 'PricingPlans',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);
