import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PaymentAttributes {
  id: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  receipt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentCreationAttributes extends Optional<
  PaymentAttributes,
  'id' | 'paymentId' | 'signature' | 'status' | 'createdAt' | 'updatedAt'
> {}

export class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  declare public id: string;
  declare public orderId: string;
  declare public paymentId?: string;
  declare public signature?: string;
  declare public amount: number;
  declare public currency: string;
  declare public status: 'created' | 'paid' | 'failed';
  declare public receipt?: string;
  declare public customerName?: string;
  declare public customerEmail?: string;
  declare public customerPhone?: string;
  declare public notes?: object;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'INR',
    },
    status: {
      type: DataTypes.ENUM('created', 'paid', 'failed'),
      defaultValue: 'created',
    },
    receipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.JSONB,
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
    tableName: 'Payments',
  }
);
