import { SubscriptionHistory } from '../models/SubscriptionHistory.model';
import { Subscription } from '../models/Subscription.model';
import { logger } from '@hrm/common';

export interface CreateHistoryEventParams {
  subscriptionId: number;
  companyId: string;
  eventType: SubscriptionHistory['eventType'];
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
}

export class SubscriptionHistoryService {
  /**
   * Create a history event for subscription changes
   */
  static async createHistoryEvent(params: CreateHistoryEventParams): Promise<SubscriptionHistory> {
    try {
      const history = await SubscriptionHistory.create({
        ...params,
        metadata: params.metadata || {},
      });

      logger.info(`Subscription history event created: ${params.eventType} for subscription ${params.subscriptionId}`);
      return history;
    } catch (error) {
      logger.error('Error creating subscription history event:', error);
      throw error;
    }
  }

  /**
   * Log subscription creation
   */
  static async logSubscriptionCreated(subscription: Subscription): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'created',
      newStatus: subscription.status,
      newPricingPlanId: subscription.pricingPlanId,
      amount: subscription.amount,
      currency: subscription.currency,
      description: `Subscription created with ${subscription.interval} billing`,
      metadata: {
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
        autoRenew: subscription.autoRenew,
      },
    });
  }

  /**
   * Log trial start
   */
  static async logTrialStarted(subscription: Subscription): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'trial_started',
      newStatus: subscription.status,
      description: '14-day trial period started',
      metadata: {
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
      },
    });
  }

  /**
   * Log trial end
   */
  static async logTrialEnded(subscription: Subscription): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'trial_ended',
      previousStatus: 'trial',
      newStatus: subscription.status,
      description: 'Trial period ended',
      metadata: {
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
      },
    });
  }

  /**
   * Log payment success
   */
  static async logPaymentSuccess(
    subscription: Subscription,
    amount: number,
    transactionId: string,
    paymentMethod: string = 'razorpay',
    razorpayEventId?: string
  ): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'payment_successful',
      newStatus: subscription.status,
      amount,
      currency: subscription.currency,
      paymentMethod,
      transactionId,
      razorpayEventId,
      description: `Payment of ${amount} ${subscription.currency} successful`,
      metadata: {
        paymentDate: new Date(),
        nextBillingDate: subscription.nextBillingDate,
      },
    });
  }

  /**
   * Log payment failure
   */
  static async logPaymentFailure(
    subscription: Subscription,
    razorpayEventId?: string,
    errorMessage?: string
  ): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'payment_failed',
      newStatus: subscription.status,
      razorpayEventId,
      description: `Payment failed (attempt ${subscription.failedPaymentAttempts + 1})`,
      metadata: {
        failedPaymentAttempts: subscription.failedPaymentAttempts + 1,
        errorMessage,
        paymentDate: new Date(),
      },
    });
  }

  /**
   * Log subscription cancellation
   */
  static async logSubscriptionCancelled(subscription: Subscription): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'cancelled',
      previousStatus: subscription.status,
      newStatus: 'cancelled',
      description: 'Subscription cancelled by user',
      metadata: {
        cancelledAt: new Date(),
        autoRenew: subscription.autoRenew,
      },
    });
  }

  /**
   * Log subscription pause
   */
  static async logSubscriptionPaused(subscription: Subscription): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'paused',
      previousStatus: subscription.status,
      newStatus: 'paused',
      description: 'Subscription paused',
      metadata: {
        pausedAt: new Date(),
      },
    });
  }

  /**
   * Log subscription resume
   */
  static async logSubscriptionResumed(subscription: Subscription): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'resumed',
      previousStatus: subscription.status,
      newStatus: 'active',
      description: 'Subscription resumed',
      metadata: {
        resumedAt: new Date(),
      },
    });
  }

  /**
   * Log plan change
   */
  static async logPlanChanged(
    subscription: Subscription,
    previousPricingPlanId: number,
    newPricingPlanId: number,
    previousAmount: number,
    newAmount: number
  ): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'plan_changed',
      previousStatus: subscription.status,
      newStatus: subscription.status,
      previousPricingPlanId,
      newPricingPlanId,
      amount: newAmount,
      currency: subscription.currency,
      description: `Plan changed from ${previousAmount} to ${newAmount} ${subscription.currency}`,
      metadata: {
        previousAmount,
        newAmount,
        changedAt: new Date(),
      },
    });
  }

  /**
   * Log subscription reactivation
   */
  static async logSubscriptionReactivated(subscription: Subscription): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'reactivated',
      previousStatus: 'expired',
      newStatus: 'active',
      description: 'Subscription reactivated after payment',
      metadata: {
        reactivatedAt: new Date(),
        failedPaymentAttempts: 0,
      },
    });
  }

  /**
   * Log subscription expiry
   */
  static async logSubscriptionExpired(subscription: Subscription): Promise<SubscriptionHistory> {
    return this.createHistoryEvent({
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
      eventType: 'expired',
      previousStatus: subscription.status,
      newStatus: 'expired',
      description: 'Subscription expired due to payment failures',
      metadata: {
        expiredAt: new Date(),
        failedPaymentAttempts: subscription.failedPaymentAttempts,
      },
    });
  }

  /**
   * Get subscription history
   */
  static async getSubscriptionHistory(
    subscriptionId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ history: SubscriptionHistory[]; total: number }> {
    try {
      const { count, rows } = await SubscriptionHistory.findAndCountAll({
        where: { subscriptionId },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        history: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching subscription history:', error);
      throw error;
    }
  }

  /**
   * Get company subscription history
   */
  static async getCompanySubscriptionHistory(
    companyId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ history: SubscriptionHistory[]; total: number }> {
    try {
      const { count, rows } = await SubscriptionHistory.findAndCountAll({
        where: { companyId },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        history: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching company subscription history:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(
    subscriptionId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ history: SubscriptionHistory[]; total: number }> {
    try {
      const { count, rows } = await SubscriptionHistory.findAndCountAll({
        where: {
          subscriptionId,
          eventType: ['payment_successful', 'payment_failed'],
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        history: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Get events by type
   */
  static async getEventsByType(
    subscriptionId: number,
    eventType: SubscriptionHistory['eventType'],
    limit: number = 50,
    offset: number = 0
  ): Promise<{ history: SubscriptionHistory[]; total: number }> {
    try {
      const { count, rows } = await SubscriptionHistory.findAndCountAll({
        where: { subscriptionId, eventType },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        history: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching events by type:', error);
      throw error;
    }
  }

  /**
   * Get recent events for dashboard
   */
  static async getRecentEvents(
    companyId: string,
    limit: number = 10
  ): Promise<SubscriptionHistory[]> {
    try {
      const events = await SubscriptionHistory.findAll({
        where: { companyId },
        order: [['createdAt', 'DESC']],
        limit,
      });

      return events;
    } catch (error) {
      logger.error('Error fetching recent events:', error);
      throw error;
    }
  }

  /**
   * Get subscription statistics
   */
  static async getSubscriptionStatistics(subscriptionId: number): Promise<{
    totalEvents: number;
    paymentEvents: number;
    successfulPayments: number;
    failedPayments: number;
    statusChanges: number;
    lastPaymentDate?: Date;
    totalRevenue: number;
  }> {
    try {
      const [
        totalEvents,
        paymentEvents,
        successfulPayments,
        failedPayments,
        statusChanges
      ] = await Promise.all([
        SubscriptionHistory.count({ where: { subscriptionId } }),
        SubscriptionHistory.count({
          where: {
            subscriptionId,
            eventType: ['payment_successful', 'payment_failed'],
          },
        }),
        SubscriptionHistory.count({
          where: { subscriptionId, eventType: 'payment_successful' },
        }),
        SubscriptionHistory.count({
          where: { subscriptionId, eventType: 'payment_failed' },
        }),
        SubscriptionHistory.count({
          where: {
            subscriptionId,
            eventType: ['created', 'cancelled', 'paused', 'resumed', 'reactivated', 'expired'],
          },
        }),
      ]);

      // Get last successful payment date and total revenue
      const lastPayment = await SubscriptionHistory.findOne({
        where: {
          subscriptionId,
          eventType: 'payment_successful',
        },
        order: [['createdAt', 'DESC']],
      });

      const totalRevenueResult = await SubscriptionHistory.sum('amount', {
        where: {
          subscriptionId,
          eventType: 'payment_successful',
        },
      });

      return {
        totalEvents,
        paymentEvents,
        successfulPayments,
        failedPayments,
        statusChanges,
        lastPaymentDate: lastPayment?.createdAt,
        totalRevenue: Number(totalRevenueResult) || 0,
      };
    } catch (error) {
      logger.error('Error fetching subscription statistics:', error);
      throw error;
    }
  }
}
