import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Employee } from './Employee.model';
import { Company } from './Company.model';
import { AttendanceStatus } from '@hrm/common';

export interface AttendanceAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceCreationAttributes
  extends Optional<AttendanceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Attendance
  extends Model<AttendanceAttributes, AttendanceCreationAttributes>
  implements AttendanceAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public date!: Date;
  public checkIn?: Date;
  public checkOut?: Date;
  public status!: AttendanceStatus;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public employee?: Employee;
  public company?: Company;
}

Attendance.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'half_day'),
      defaultValue: 'present',
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'Attendance',
    indexes: [
      { fields: ['employeeId', 'date'], unique: true },
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['date'] },
      { fields: ['status'] },
    ],
  }
);

Attendance.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

Attendance.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Employee.hasMany(Attendance, {
  foreignKey: 'employeeId',
  as: 'attendances',
});

Company.hasMany(Attendance, {
  foreignKey: 'companyId',
  as: 'attendances',
});

