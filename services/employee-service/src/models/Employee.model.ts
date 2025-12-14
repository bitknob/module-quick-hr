import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Company } from './Company.model';

export interface EmployeeAttributes {
  id: string;
  userId: string;
  companyId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  jobTitle: string;
  department: string;
  managerId?: string;
  hireDate: Date;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeCreationAttributes
  extends Optional<EmployeeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: string;
  public userId!: string;
  public companyId!: string;
  public employeeId!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public phoneNumber?: string;
  public dateOfBirth?: Date;
  public address?: string;
  public jobTitle!: string;
  public department!: string;
  public managerId?: string;
  public hireDate!: Date;
  public salary?: number;
  public status!: 'active' | 'inactive' | 'terminated';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public manager?: Employee;
  public subordinates?: Employee[];
  public company?: Company;
}

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id',
      },
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'terminated'),
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
    tableName: 'Employees',
    indexes: [
      { fields: ['companyId', 'employeeId'], unique: true },
      { fields: ['email'] },
      { fields: ['userId'] },
      { fields: ['companyId'] },
      { fields: ['managerId'] },
      { fields: ['department'] },
      { fields: ['status'] },
    ],
  }
);

Employee.hasMany(Employee, {
  foreignKey: 'managerId',
  as: 'subordinates',
});

Employee.belongsTo(Employee, {
  foreignKey: 'managerId',
  as: 'manager',
});

Employee.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Company.hasMany(Employee, {
  foreignKey: 'companyId',
  as: 'employees',
});

