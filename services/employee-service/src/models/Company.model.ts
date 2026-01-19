import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CompanyAttributes {
  id: string;
  name: string;
  code: string;
  description?: string;
  profileImageUrl?: string;
  hrbpId?: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyCreationAttributes extends Optional<
  CompanyAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'status'
> {}

export class Company
  extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes
{
  declare public id: string;
  declare public name: string;
  declare public code: string;
  declare public description?: string;
  declare public profileImageUrl?: string;
  declare public hrbpId?: string;
  declare public status: 'active' | 'inactive';
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profileImageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    hrbpId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
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
    tableName: 'Companies',
    indexes: [{ fields: ['code'] }, { fields: ['status'] }, { fields: ['hrbpId'] }],
  }
);
