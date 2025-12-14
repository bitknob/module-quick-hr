import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Company } from './Company.model';

export interface DepartmentAttributes {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  headId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DepartmentCreationAttributes
  extends Optional<DepartmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: string;
  public companyId!: string;
  public name!: string;
  public description?: string;
  public headId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public company?: Company;
}

Department.init(
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
    headId: {
      type: DataTypes.UUID,
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
    tableName: 'Departments',
    indexes: [
      { fields: ['companyId', 'name'], unique: true },
      { fields: ['companyId'] },
    ],
  }
);

Department.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Company.hasMany(Department, {
  foreignKey: 'companyId',
  as: 'departments',
});

