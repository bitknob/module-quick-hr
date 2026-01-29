import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SubscriptionHistoryAttributes {
  id: number;
  subscriptionId: number;
  companyId: string;
  eventType: 'created' | 'updated' | 'cancelled' | 'paused' | 'resumed' | 'payment_successful' | 'payment_failed' | 'trial_started' | 'trial_ended' | 'plan_changed' | 'reactivated' | 'expired';
  previousStatus?: string;
  newStatus?: string;
  previousPricingPlanId?: number;
  newPricingPlanId?: number;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
  razorpayEventId?: string;
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionHistoryCreationAttributes
  extends Optional<SubscriptionHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class SubscriptionHistory
  extends Model<SubscriptionHistoryAttributes, SubscriptionHistoryCreationAttributes>
  implements SubscriptionHistoryAttributes
{
  public id!: number;
  public subscriptionId!: number;
  public companyId!: string;
  public eventType!: 'created' | 'updated' | 'cancelled' | 'paused' | 'resumed' | 'payment_successful' | 'payment_failed' | 'trial_started' | 'trial_ended' | 'plan_changed' | 'reactivated' | 'expired';
  public previousStatus?: string;
  public newStatus?: string;
  public previousPricingPlanId?: number;
  public newPricingPlanId?: number;
  public amount?: number;
  public currency?: string;
  public paymentMethod?: string;
  public transactionId?: string;
  public razorpayEventId?: string;
  public description?: string;
  public metadata?: any;
  public createdAt!: Date;
  public updatedAt!: Date;

  public readonly toJSON = () => {
    const values = { ...this.get() };
    return {
      id: values.id,
      subscriptionId: values.subscriptionId,
      companyId: values.companyId,
      eventType: values.eventType,
      previousStatus: values.previousStatus,
      newStatus: values.newStatus,
      previousPricingPlanId: values.previousPricingPlanId,
      newPricingPlanId: values.newPricingPlanId,
      amount: values.amount ? Number(values.amount) : null,
      currency: values.currency,
      paymentMethod: values.paymentMethod,
      transactionId: values.transactionId,
      razorpayEventId: values.razorpayEventId,
      description: values.description,
      metadata: values.metadata,
      createdAt: values.createdAt,
      updatedAt: values.updatedAt,
    };
  };
}

SubscriptionHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'subscription_id',
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'company_id',
    },
    eventType: {
      type: DataTypes.ENUM(
        'created',
        'updated', 
        'cancelled',
        'paused',
        'resumed',
        'payment_successful',
        'payment_failed',
        'trial_started',
        'trial_ended',
        'plan_changed',
        'reactivated',
        'expired'
      ),
      allowNull: false,
      field: 'event_type',
    },
    previousStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'previous_status',
    },
    newStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'new_status',
    },
    previousPricingPlanId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'previous_pricing_plan_id',
    },
    newPricingPlanId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'new_pricing_plan_id',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: 'INR',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'payment_method',
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'transaction_id',
    },
    razorpayEventId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'razorpay_event_id',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'SubscriptionHistory',
    tableName: 'SubscriptionHistory',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);
