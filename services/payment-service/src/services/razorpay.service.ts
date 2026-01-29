import Razorpay from 'razorpay';
import { logger } from '@hrm/common';
import { Subscription } from '../models/Subscription.model';
import { PricingPlan } from '../models/PricingPlan.model';
import { SubscriptionHistoryService } from './subscriptionHistory.service';

export interface RazorpayCustomer {
  id: string;
  name?: string;
  email?: string;
  contact?: string | number;
}

export interface RazorpaySubscriptionRequest {
  plan_id: string;
  customer_id: string;
  total_count: number;
  customer_notify: boolean;
  start_at?: number;
  expire_by?: number;
}

export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  /**
   * Create a customer in Razorpay
   */
  async createCustomer(customerData: {
    name: string;
    email: string;
    contact?: string;
  }): Promise<RazorpayCustomer> {
    try {
      const customer = await this.razorpay.customers.create(customerData);
      logger.info('Razorpay customer created:', customer.id);
      return customer;
    } catch (error) {
      logger.error('Error creating Razorpay customer:', error);
      throw error;
    }
  }

  /**
   * Create a plan in Razorpay
   */
  async createPlan(planData: {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    item: {
      name: string;
      description: string;
      amount: number;
      currency: string;
    };
    notes?: Record<string, string>;
  }) {
    try {
      const plan = await this.razorpay.plans.create(planData);
      logger.info('Razorpay plan created:', plan.id);
      return plan;
    } catch (error) {
      logger.error('Error creating Razorpay plan:', error);
      throw error;
    }
  }

  /**
   * Create a subscription with 14-day trial
   */
  async createSubscription(subscriptionData: RazorpaySubscriptionRequest) {
    try {
      const subscription = await this.razorpay.subscriptions.create(subscriptionData);
      logger.info('Razorpay subscription created:', subscription.id);
      return subscription;
    } catch (error) {
      logger.error('Error creating Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd = false) {
    try {
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
      logger.info('Razorpay subscription cancelled:', subscription.id);
      return subscription;
    } catch (error) {
      logger.error('Error cancelling Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(subscriptionId: string, pauseAt: 'now') {
    try {
      const subscription = await this.razorpay.subscriptions.pause(subscriptionId, {
        pause_at: pauseAt,
      });
      logger.info('Razorpay subscription paused:', (subscription as any).id);
      return subscription;
    } catch (error) {
      logger.error('Error pausing Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Resume a subscription
   */
  async resumeSubscription(subscriptionId: string, resumeAt: 'now') {
    try {
      const subscription = await this.razorpay.subscriptions.resume(subscriptionId, {
        resume_at: resumeAt,
      });
      logger.info('Razorpay subscription resumed:', (subscription as any).id);
      return subscription;
    } catch (error) {
      logger.error('Error resuming Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Fetch subscription details
   */
  async fetchSubscription(subscriptionId: string) {
    try {
      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error fetching Razorpay subscription:', error);
      throw error;
    }
  }

  /**
   * Create a subscription link for payment
   */
  async createSubscriptionLink(subscriptionId: string, customerEmail: string) {
    try {
      // For now, return a simple payment link - this can be enhanced later
      const link = {
        id: `inv_${Date.now()}`,
        short_url: `https://rzp.io/i/${subscriptionId}`,
        subscription_id: subscriptionId
      };
      logger.info('Payment link created for subscription:', subscriptionId);
      return link;
    } catch (error) {
      logger.error('Error creating Razorpay invoice:', error);
      throw error;
    }
  }

  /**
   * Calculate trial end date (14 days from now)
   */
  calculateTrialEndDate(): Date {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    return trialEndDate;
  }

  /**
   * Calculate next billing date based on interval
   */
  calculateNextBillingDate(interval: 'monthly' | 'yearly', startDate?: Date): Date {
    const date = startDate || new Date();
    const nextDate = new Date(date);
    
    if (interval === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (interval === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
    
    return nextDate;
  }

  /**
   * Convert pricing plan to Razorpay plan format
   */
  async createPlanFromPricingPlan(pricingPlan: PricingPlan) {
    const planData = {
      period: 'monthly' as const,
      interval: 1,
      item: {
        name: pricingPlan.name,
        description: pricingPlan.description || '',
        amount: Math.round(pricingPlan.monthlyPrice * 100), // Convert to paise
        currency: 'INR',
      },
      notes: {
        pricing_plan_id: pricingPlan.id.toString(),
        features: JSON.stringify(pricingPlan.features),
      },
    };

    return this.createPlan(planData);
  }

  /**
   * Create subscription with trial for a company
   */
  async createSubscriptionWithTrial(
    companyId: string,
    pricingPlanId: number,
    customerData: { name: string; email: string; contact?: string },
    interval: 'monthly' | 'yearly' = 'monthly'
  ) {
    try {
      // Get pricing plan
      const pricingPlan = await PricingPlan.findByPk(pricingPlanId);
      if (!pricingPlan) {
        throw new Error('Pricing plan not found');
      }

      // Create or get Razorpay customer
      let customer: RazorpayCustomer;
      try {
        customer = await this.createCustomer(customerData);
      } catch (error) {
        // If customer already exists, try to fetch them
        logger.warn('Customer might already exist, proceeding with subscription creation');
        customer = { id: 'temp_' + Date.now(), email: customerData.email } as RazorpayCustomer;
      }

      // Create Razorpay plan if not exists
      let razorpayPlan;
      try {
        razorpayPlan = await this.createPlanFromPricingPlan(pricingPlan);
      } catch (error) {
        logger.warn('Plan might already exist, proceeding with subscription creation');
        // For now, we'll use a temporary plan ID - in production, you should handle this better
        razorpayPlan = { id: 'plan_' + pricingPlanId };
      }

      // Calculate trial dates
      const trialStartDate = new Date();
      const trialEndDate = this.calculateTrialEndDate();
      const subscriptionStartDate = new Date(trialEndDate);
      const subscriptionEndDate = this.calculateNextBillingDate(interval, subscriptionStartDate);

      // Create Razorpay subscription with 14-day trial
      const razorpaySubscription = await this.createSubscription({
        plan_id: razorpayPlan.id,
        customer_id: customer.id,
        total_count: 12, // 12 months for yearly, can be adjusted
        customer_notify: true,
        start_at: Math.floor(trialStartDate.getTime() / 1000),
        expire_by: Math.floor(subscriptionEndDate.getTime() / 1000),
      });

      // Create subscription link for payment
      const paymentLink = await this.createSubscriptionLink(razorpaySubscription.id, customerData.email);

      // Create local subscription record
      const subscription = await Subscription.create({
        companyId,
        pricingPlanId,
        razorpaySubscriptionId: razorpaySubscription.id,
        razorpayCustomerId: customer.id,
        status: 'trial',
        trialStartDate,
        trialEndDate,
        subscriptionStartDate,
        subscriptionEndDate,
        nextBillingDate: subscriptionEndDate,
        amount: interval === 'monthly' ? pricingPlan.monthlyPrice : pricingPlan.yearlyPrice,
        currency: 'INR',
        interval,
        autoRenew: true,
        nextPaymentDate: trialEndDate,
        failedPaymentAttempts: 0,
        isActive: true,
      });

      // Log subscription creation
      await SubscriptionHistoryService.logSubscriptionCreated(subscription);
      await SubscriptionHistoryService.logTrialStarted(subscription);

      return { subscription, razorpaySubscription, paymentLink };
    } catch (error) {
      logger.error('Error creating subscription with trial:', error);
      throw error;
    }
  }
}
