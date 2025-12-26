import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Employee } from './Employee.model';
import { Company } from './Company.model';

export type DocumentType = 
  | 'id_proof' 
  | 'address_proof' 
  | 'pan_card' 
  | 'aadhaar_card' 
  | 'passport' 
  | 'driving_license' 
  | 'educational_certificate' 
  | 'experience_certificate' 
  | 'offer_letter' 
  | 'appointment_letter' 
  | 'relieving_letter' 
  | 'salary_slip' 
  | 'bank_statement' 
  | 'form_16' 
  | 'other';

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface EmployeeDocumentAttributes {
  id: string;
  employeeId: string;
  companyId: string;
  documentType: DocumentType;
  documentName: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  expiryDate?: Date;
  notes?: string;
  uploadedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeDocumentCreationAttributes
  extends Optional<EmployeeDocumentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'verifiedBy' | 'verifiedAt' | 'rejectionReason' | 'expiryDate' | 'notes'> {}

export class EmployeeDocument
  extends Model<EmployeeDocumentAttributes, EmployeeDocumentCreationAttributes>
  implements EmployeeDocumentAttributes
{
  public id!: string;
  public employeeId!: string;
  public companyId!: string;
  public documentType!: DocumentType;
  public documentName!: string;
  public fileUrl!: string;
  public fileName!: string;
  public fileSize!: number;
  public mimeType!: string;
  public status!: DocumentStatus;
  public verifiedBy?: string;
  public verifiedAt?: Date;
  public rejectionReason?: string;
  public expiryDate?: Date;
  public notes?: string;
  public uploadedBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public employee?: Employee;
  public company?: Company;
  public verifier?: Employee;
}

EmployeeDocument.init(
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
    documentType: {
      type: DataTypes.ENUM(
        'id_proof',
        'address_proof',
        'pan_card',
        'aadhaar_card',
        'passport',
        'driving_license',
        'educational_certificate',
        'experience_certificate',
        'offer_letter',
        'appointment_letter',
        'relieving_letter',
        'salary_slip',
        'bank_statement',
        'form_16',
        'other'
      ),
      allowNull: false,
    },
    documentName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected', 'expired'),
      defaultValue: 'pending',
      allowNull: false,
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    uploadedBy: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: 'EmployeeDocuments',
    indexes: [
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['documentType'] },
      { fields: ['status'] },
      { fields: ['employeeId', 'documentType'] },
    ],
  }
);

EmployeeDocument.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

EmployeeDocument.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

EmployeeDocument.belongsTo(Employee, {
  foreignKey: 'verifiedBy',
  as: 'verifier',
});

Employee.hasMany(EmployeeDocument, {
  foreignKey: 'employeeId',
  as: 'documents',
});

Company.hasMany(EmployeeDocument, {
  foreignKey: 'companyId',
  as: 'documents',
});

