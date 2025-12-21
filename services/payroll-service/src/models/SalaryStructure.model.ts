import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SalaryStructureAttributes {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SalaryStructureCreationAttributes
  extends Optional<SalaryStructureAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class SalaryStructure
  extends Model<SalaryStructureAttributes, SalaryStructureCreationAttributes>
  implements SalaryStructureAttributes
{
  public id!: string;
  public companyId!: string;
  public name!: string;
  public description?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SalaryStructure.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'SalaryStructures',
    indexes: [
      { fields: ['companyId'] },
      { fields: ['companyId', 'name'] },
      { fields: ['isActive'] },
    ],
  }
);

