import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { PricingPlan } from './PricingPlan.model';

export interface SubscriptionAttributes {
  id: number;
  companyId: string;
  pricingPlanId: number;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'paused';
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  nextBillingDate?: Date;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  autoRenew: boolean;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  failedPaymentAttempts: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionCreationAttributes
  extends Optional<SubscriptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Subscription
  extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
  implements SubscriptionAttributes
{
  public id!: number;
  public companyId!: string;
  public pricingPlanId!: number;
  public razorpaySubscriptionId?: string;
  public razorpayCustomerId?: string;
  public status!: 'trial' | 'active' | 'cancelled' | 'expired' | 'paused';
  public trialStartDate?: Date;
  public trialEndDate?: Date;
  public subscriptionStartDate?: Date;
  public subscriptionEndDate?: Date;
  public nextBillingDate?: Date;
  public amount!: number;
  public currency!: string;
  public interval!: 'monthly' | 'yearly';
  public autoRenew!: boolean;
  public lastPaymentDate?: Date;
  public nextPaymentDate?: Date;
  public failedPaymentAttempts!: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  public readonly toJSON = () => {
    const values = { ...this.get() };
    return {
      id: values.id,
      companyId: values.companyId,
      pricingPlanId: values.pricingPlanId,
      razorpaySubscriptionId: values.razorpaySubscriptionId,
      razorpayCustomerId: values.razorpayCustomerId,
      status: values.status,
      trialStartDate: values.trialStartDate,
      trialEndDate: values.trialEndDate,
      subscriptionStartDate: values.subscriptionStartDate,
      subscriptionEndDate: values.subscriptionEndDate,
      nextBillingDate: values.nextBillingDate,
      amount: Number(values.amount),
      currency: values.currency,
      interval: values.interval,
      autoRenew: values.autoRenew,
      lastPaymentDate: values.lastPaymentDate,
      nextPaymentDate: values.nextPaymentDate,
      failedPaymentAttempts: values.failedPaymentAttempts,
      isActive: values.isActive,
      createdAt: values.createdAt,
      updatedAt: values.updatedAt,
    };
  };

  // Check if trial is still active
  public isTrialActive(): boolean {
    if (!this.trialStartDate || !this.trialEndDate) return false;
    const now = new Date();
    return now >= this.trialStartDate && now <= this.trialEndDate;
  }

  // Get remaining trial days
  public getRemainingTrialDays(): number {
    if (!this.trialEndDate) return 0;
    const now = new Date();
    const diffTime = this.trialEndDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Check if subscription needs payment
  public needsPayment(): boolean {
    if (this.status === 'trial' && this.isTrialActive()) return false;
    if (this.status === 'active' && this.nextPaymentDate) {
      return new Date() >= this.nextPaymentDate;
    }
    return false;
  }
}

Subscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'company_id',
    },
    pricingPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'pricing_plan_id',
    },
    razorpaySubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'razorpay_subscription_id',
    },
    razorpayCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'razorpay_customer_id',
    },
    status: {
      type: DataTypes.ENUM('trial', 'active', 'cancelled', 'expired', 'paused'),
      allowNull: false,
      defaultValue: 'trial',
    },
    trialStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'trial_start_date',
    },
    trialEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'trial_end_date',
    },
    subscriptionStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_start_date',
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_end_date',
    },
    nextBillingDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'next_billing_date',
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
    interval: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      allowNull: false,
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'auto_renew',
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_payment_date',
    },
    nextPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'next_payment_date',
    },
    failedPaymentAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'failed_payment_attempts',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
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
    modelName: 'Subscription',
    tableName: 'Subscriptions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

// Define associations after model initialization
Subscription.belongsTo(PricingPlan, { foreignKey: 'pricingPlanId', as: 'pricingPlan' });
