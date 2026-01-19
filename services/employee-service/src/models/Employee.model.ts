import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Company } from './Company.model';

export interface EmployeeAttributes {
  id: string;
  userEmail: string;
  companyId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  userCompEmail: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  jobTitle: string;
  department: string;
  managerId?: string;
  hireDate: Date;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeCreationAttributes extends Optional<
  EmployeeAttributes,
  'id' | 'createdAt' | 'updatedAt'
> {}

export class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  declare public id: string;
  declare public userEmail: string;
  declare public companyId: string;
  declare public employeeId: string;
  declare public firstName: string;
  declare public lastName: string;
  declare public userCompEmail: string;
  declare public phoneNumber?: string;
  declare public dateOfBirth?: Date;
  declare public address?: string;
  declare public jobTitle: string;
  declare public department: string;
  declare public managerId?: string;
  declare public hireDate: Date;
  declare public salary?: number;
  declare public status: 'active' | 'inactive' | 'terminated';
  declare public role?: string;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public manager?: Employee;
  declare public subordinates?: Employee[];
  declare public company?: Company;
}

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
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
    userCompEmail: {
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
    role: {
      type: DataTypes.STRING(50),
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
    tableName: 'Employees',
    indexes: [
      { fields: ['companyId', 'employeeId'], unique: true },
      { fields: ['userCompEmail'] },
      { fields: ['userEmail'] },
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
