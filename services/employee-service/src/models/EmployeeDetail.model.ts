import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Employee } from './Employee.model';
import { Company } from './Company.model';

export interface EmployeeDetailAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  bankIFSC?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  drivingLicenseNumber?: string;
  bloodGroup?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  spouseName?: string;
  fatherName?: string;
  motherName?: string;
  permanentAddress?: string;
  currentAddress?: string;
  previousEmployer?: string;
  previousDesignation?: string;
  previousSalary?: number;
  noticePeriod?: number;
  skills?: string[];
  languages?: string[];
  additionalInfo?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeDetailCreationAttributes
  extends Optional<EmployeeDetailAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class EmployeeDetail
  extends Model<EmployeeDetailAttributes, EmployeeDetailCreationAttributes>
  implements EmployeeDetailAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public emergencyContactName?: string;
  public emergencyContactPhone?: string;
  public emergencyContactRelation?: string;
  public bankAccountNumber?: string;
  public bankName?: string;
  public bankBranch?: string;
  public bankIFSC?: string;
  public panNumber?: string;
  public aadhaarNumber?: string;
  public passportNumber?: string;
  public drivingLicenseNumber?: string;
  public bloodGroup?: string;
  public maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  public spouseName?: string;
  public fatherName?: string;
  public motherName?: string;
  public permanentAddress?: string;
  public currentAddress?: string;
  public previousEmployer?: string;
  public previousDesignation?: string;
  public previousSalary?: number;
  public noticePeriod?: number;
  public skills?: string[];
  public languages?: string[];
  public additionalInfo?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public employee?: Employee;
  public company?: Company;
}

EmployeeDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
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
    emergencyContactName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emergencyContactPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    emergencyContactRelation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bankAccountNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bankBranch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bankIFSC: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    panNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    aadhaarNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    passportNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    drivingLicenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    bloodGroup: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    maritalStatus: {
      type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
      allowNull: true,
    },
    spouseName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fatherName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    motherName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    permanentAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    currentAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    previousEmployer: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    previousDesignation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    previousSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    noticePeriod: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    additionalInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
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
    tableName: 'EmployeeDetails',
    indexes: [
      { fields: ['employeeId'], unique: true },
      { fields: ['companyId'] },
      { fields: ['panNumber'] },
      { fields: ['aadhaarNumber'] },
    ],
  }
);

EmployeeDetail.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

EmployeeDetail.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Employee.hasOne(EmployeeDetail, {
  foreignKey: 'employeeId',
  as: 'details',
});

Company.hasMany(EmployeeDetail, {
  foreignKey: 'companyId',
  as: 'employeeDetails',
});

