import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { SalaryStructure } from './SalaryStructure.model';

export interface EmployeeSalaryStructureAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  salaryStructureId: string;
  ctc: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeSalaryStructureCreationAttributes
  extends Optional<EmployeeSalaryStructureAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class EmployeeSalaryStructure
  extends Model<EmployeeSalaryStructureAttributes, EmployeeSalaryStructureCreationAttributes>
  implements EmployeeSalaryStructureAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public salaryStructureId!: string;
  public ctc!: number;
  public effectiveFrom!: Date;
  public effectiveTo?: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public salaryStructure?: SalaryStructure;
}

EmployeeSalaryStructure.init(
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
    salaryStructureId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'SalaryStructures',
        key: 'id',
      },
    },
    ctc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    effectiveTo: {
      type: DataTypes.DATE,
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
    tableName: 'EmployeeSalaryStructures',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['salaryStructureId'] },
      { fields: ['isActive'] },
      { fields: ['effectiveFrom', 'effectiveTo'] },
      { fields: ['employeeId', 'isActive'], unique: true, where: { isActive: true } },
    ],
  }
);

// Associations are defined in index.ts to avoid circular dependencies

