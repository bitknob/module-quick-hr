import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export enum VerificationType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export interface VerificationAttributes {
  id: string;
  userId: string;
  type: VerificationType;
  token: string;
  expiresAt: Date;
  verifiedAt?: Date;
  attempts: number;
  metadata?: any;
  requestBody?: any;
  responseBody?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
  providerMessageId?: string;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the attributes required significantly for creating a new verification
// 'id', 'attempts', and 'metadata' are optional as they have default values or are nullable
export interface VerificationCreationAttributes extends Optional<
  VerificationAttributes,
  | 'id'
  | 'attempts'
  | 'metadata'
  | 'verifiedAt'
  | 'requestBody'
  | 'responseBody'
  | 'ipAddress'
  | 'userAgent'
  | 'status'
  | 'providerMessageId'
  | 'errorMessage'
> {}

export class Verification
  extends Model<VerificationAttributes, VerificationCreationAttributes>
  implements VerificationAttributes
{
  public id!: string;
  public userId!: string;
  public type!: VerificationType;
  public token!: string;
  public expiresAt!: Date;
  public verifiedAt?: Date;
  public attempts!: number;
  public metadata?: any;
  public requestBody?: any;
  public responseBody?: any;
  public ipAddress?: string;
  public userAgent?: string;
  public status?: string;
  public providerMessageId?: string;
  public errorMessage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Verification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('EMAIL', 'PHONE'),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    requestBody: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    responseBody: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      allowNull: true,
    },
    providerMessageId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    errorMessage: {
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
    tableName: 'Verifications',
    indexes: [{ fields: ['userId'] }, { fields: ['token'] }, { fields: ['type'] }],
  }
);
