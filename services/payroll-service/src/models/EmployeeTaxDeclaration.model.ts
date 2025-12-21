import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface EmployeeTaxDeclarationAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  financialYear: string;
  declarations: any;
  totalDeclaredAmount: number;
  verifiedAmount?: number;
  verificationStatus: 'pending' | 'partial' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  documents?: string[];
  notes?: string;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeTaxDeclarationCreationAttributes
  extends Optional<EmployeeTaxDeclarationAttributes, 'id' | 'verificationStatus' | 'createdAt' | 'updatedAt'> {}

export class EmployeeTaxDeclaration
  extends Model<EmployeeTaxDeclarationAttributes, EmployeeTaxDeclarationCreationAttributes>
  implements EmployeeTaxDeclarationAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public financialYear!: string;
  public declarations!: any;
  public totalDeclaredAmount!: number;
  public verifiedAmount?: number;
  public verificationStatus!: 'pending' | 'partial' | 'verified' | 'rejected';
  public verifiedBy?: string;
  public verifiedAt?: Date;
  public documents?: string[];
  public notes?: string;
  public submittedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmployeeTaxDeclaration.init(
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
    financialYear: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    declarations: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    totalDeclaredAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    verifiedAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'partial', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    verifiedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    documents: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedAt: {
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
    tableName: 'EmployeeTaxDeclarations',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['financialYear'] },
      { fields: ['employeeId', 'financialYear'], unique: true },
      { fields: ['verificationStatus'] },
    ],
  }
);

