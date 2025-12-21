import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface RequestLogAttributes {
  id: string;
  serviceName?: string;
  method: string;
  url: string;
  path: string;
  queryParams?: any;
  requestHeaders?: any;
  requestBody?: any;
  responseStatus?: number;
  responseBody?: any;
  responseHeaders?: any;
  userId?: string;
  employeeId?: string;
  companyId?: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  errorMessage?: string;
  createdAt?: Date;
}

export interface RequestLogCreationAttributes
  extends Optional<RequestLogAttributes, 'id' | 'createdAt'> {}

export class RequestLogModel
  extends Model<RequestLogAttributes, RequestLogCreationAttributes>
  implements RequestLogAttributes
{
  public id!: string;
  public serviceName?: string;
  public method!: string;
  public url!: string;
  public path!: string;
  public queryParams?: any;
  public requestHeaders?: any;
  public requestBody?: any;
  public responseStatus?: number;
  public responseBody?: any;
  public responseHeaders?: any;
  public userId?: string;
  public employeeId?: string;
  public companyId?: string;
  public ipAddress?: string;
  public userAgent?: string;
  public duration?: number;
  public errorMessage?: string;
  public readonly createdAt!: Date;
}

RequestLogModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serviceName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    queryParams: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    requestHeaders: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    requestBody: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    responseStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    responseBody: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    responseHeaders: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id',
      },
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
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
  },
  {
    sequelize,
    tableName: 'RequestLogs',
    timestamps: false,
    indexes: [
      { fields: ['serviceName'] },
      { fields: ['userId'] },
      { fields: ['employeeId'] },
      { fields: ['companyId'] },
      { fields: ['method', 'path'] },
      { fields: ['responseStatus'] },
      { fields: ['createdAt'] },
    ],
  }
);

