import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Employee } from './Employee.model';
import { Company } from './Company.model';
import { LeaveType, LeaveStatus } from '@hrm/common';

export interface LeaveRequestAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaveRequestCreationAttributes
  extends Optional<LeaveRequestAttributes, 'id' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt'> {}

export class LeaveRequest
  extends Model<LeaveRequestAttributes, LeaveRequestCreationAttributes>
  implements LeaveRequestAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public leaveType!: LeaveType;
  public startDate!: Date;
  public endDate!: Date;
  public reason?: string;
  public status!: LeaveStatus;
  public approvedBy?: string;
  public approvedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public employee?: Employee;
  public company?: Company;
  public approver?: Employee;
}

LeaveRequest.init(
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
    leaveType: {
      type: DataTypes.ENUM('annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
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
    tableName: 'LeaveRequests',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['status'] },
      { fields: ['startDate', 'endDate'] },
      { fields: ['leaveType'] },
    ],
  }
);

LeaveRequest.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

LeaveRequest.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

LeaveRequest.belongsTo(Employee, {
  foreignKey: 'approvedBy',
  as: 'approver',
});

Employee.hasMany(LeaveRequest, {
  foreignKey: 'employeeId',
  as: 'leaveRequests',
});

Company.hasMany(LeaveRequest, {
  foreignKey: 'companyId',
  as: 'leaveRequests',
});

