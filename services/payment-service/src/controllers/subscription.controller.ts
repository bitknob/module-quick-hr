import { Request, Response } from 'express';
import { z } from 'zod';
import { Subscription } from '../models/Subscription.model';
import { PricingPlan } from '../models/PricingPlan.model';
import { RazorpayService } from '../services/razorpay.service';
import { SubscriptionHistoryService } from '../services/subscriptionHistory.service';
import { ResponseFormatter, logger } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database';

const CreateSubscriptionSchema = z.object({
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  billingAddress: z.string().optional(),
  pricingPlanId: z.number().int().positive('Invalid pricing plan ID'),
  customerData: z.object({
    name: z.string().min(1, 'Customer name is required'),
    personalEmail: z.string().email('Valid personal email is required'),
    companyEmail: z.string().email('Valid company email is required'),
    companyName: z.string().min(2, 'Company name is required'),
    companyCode: z.string().min(10, 'Company code must be at least 10 characters long'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    contact: z.string().optional(),
  }),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
});

const UpdateSubscriptionSchema = z.object({
  autoRenew: z.boolean().optional(),
}).partial();

export class SubscriptionController {
  private razorpayService: RazorpayService;

  constructor() {
    this.razorpayService = new RazorpayService();
  }

  static async createSubscription(req: Request, res: Response) {
    try {
      const validatedData = CreateSubscriptionSchema.parse(req.body);
      const razorpayService = new RazorpayService();

      let companyId = validatedData.companyId;

      // Company, user, and employee are created automatically in the service
      // No need to check for existing subscriptions as the service handles it

      // Create subscription with trial
      const result = await razorpayService.createSubscriptionWithTrial(
        validatedData.pricingPlanId,
        validatedData.customerData,
        validatedData.interval
      );

      // Log subscription creation and trial start (already logged in service)
      // Additional logging can be done here if needed

      ResponseFormatter.success(
        res,
        {
          subscription: result.subscription,
          paymentLink: result.paymentLink,
          trialDays: 14,
          trialEndDate: result.subscription.trialEndDate,
          companyId: result.subscription.companyId,
        },
        'Subscription created with 14-day trial'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ResponseFormatter.error(
          res,
          'Validation error',
          JSON.stringify(error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))),
          400
        );
      }
      
      logger.error('Error creating subscription:', error);
      console.error('Detailed error:', error);
      return ResponseFormatter.error(res, 'Failed to create subscription', (error as any).message || 'Unknown error', 500);
    }
  }

  static async getSubscription(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      const subscription = await Subscription.findOne({
        where: { companyId, isActive: true },
        include: [{
          model: PricingPlan,
          as: 'pricingPlan',
        }],
      });

      if (!subscription) {
        return ResponseFormatter.error(res, 'Subscription not found', '', 404);
      }

      // Add computed fields
      const subscriptionData: any = subscription.toJSON();
      subscriptionData.isTrialActive = subscription.isTrialActive();
      subscriptionData.remainingTrialDays = subscription.getRemainingTrialDays();
      subscriptionData.needsPayment = subscription.needsPayment();

      ResponseFormatter.success(
        res,
        { subscription: subscriptionData },
        'Subscription retrieved successfully'
      );
    } catch (error) {
      logger.error('Error fetching subscription:', error);
      ResponseFormatter.error(res, 'Failed to fetch subscription', '', 500);
    }
  }

  static async updateSubscription(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const validatedData = UpdateSubscriptionSchema.parse(req.body);

      const subscription = await Subscription.findOne({
        where: { companyId, isActive: true },
      });

      if (!subscription) {
        return ResponseFormatter.error(res, 'Subscription not found', '', 404);
      }

      const previousStatus = subscription.status;
      await subscription.update(validatedData);

      // Log subscription update
      await SubscriptionHistoryService.createHistoryEvent({
        subscriptionId: subscription.id,
        companyId: subscription.companyId,
        eventType: 'updated',
        previousStatus,
        newStatus: subscription.status,
        description: 'Subscription settings updated',
        metadata: validatedData,
      });

      ResponseFormatter.success(
        res,
        { subscription },
        'Subscription updated successfully'
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ResponseFormatter.error(
          res,
          'Validation error',
          JSON.stringify(error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))),
          400
        );
      }

      logger.error('Error updating subscription:', error);
      ResponseFormatter.error(res, 'Failed to update subscription', '', 500);
    }
  }

  static async cancelSubscription(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      const subscription = await Subscription.findOne({
        where: { companyId, isActive: true },
      });

      if (!subscription) {
        return ResponseFormatter.error(res, 'Subscription not found', '', 404);
      }

      // Cancel in Razorpay if subscription exists
      if (subscription.razorpaySubscriptionId) {
        const razorpayService = new RazorpayService();
        await razorpayService.cancelSubscription(subscription.razorpaySubscriptionId);
      }

      // Update local subscription
      await subscription.update({
        status: 'cancelled',
        isActive: false,
        autoRenew: false,
      });

      // Log subscription cancellation
      await SubscriptionHistoryService.logSubscriptionCancelled(subscription);

      ResponseFormatter.success(
        res,
        null,
        'Subscription cancelled successfully'
      );
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      ResponseFormatter.error(res, 'Failed to cancel subscription', '', 500);
    }
  }

  static async pauseSubscription(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      const subscription = await Subscription.findOne({
        where: { companyId, isActive: true },
      });

      if (!subscription) {
        return ResponseFormatter.error(res, 'Subscription not found', '', 404);
      }

      if (subscription.status !== 'active') {
        return ResponseFormatter.error(res, 'Only active subscriptions can be paused', '', 400);
      }

      // Pause in Razorpay if subscription exists
      if (subscription.razorpaySubscriptionId) {
        const razorpayService = new RazorpayService();
        await razorpayService.pauseSubscription(
          subscription.razorpaySubscriptionId,
          'now'
        );
      }

      // Update local subscription
      await subscription.update({
        status: 'paused',
      });

      ResponseFormatter.success(
        res,
        { subscription },
        'Subscription paused successfully'
      );
    } catch (error) {
      logger.error('Error pausing subscription:', error);
      ResponseFormatter.error(res, 'Failed to pause subscription', '', 500);
    }
  }

  static async resumeSubscription(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      const subscription = await Subscription.findOne({
        where: { companyId, isActive: true },
      });

      if (!subscription) {
        return ResponseFormatter.error(res, 'Subscription not found', '', 404);
      }

      if (subscription.status !== 'paused') {
        return ResponseFormatter.error(res, 'Only paused subscriptions can be resumed', '', 400);
      }

      // Resume in Razorpay if subscription exists
      if (subscription.razorpaySubscriptionId) {
        const razorpayService = new RazorpayService();
        await razorpayService.resumeSubscription(
          subscription.razorpaySubscriptionId,
          'now'
        );
      }

      // Update local subscription
      await subscription.update({
        status: 'active',
      });

      ResponseFormatter.success(
        res,
        { subscription },
        'Subscription resumed successfully'
      );
    } catch (error) {
      logger.error('Error resuming subscription:', error);
      ResponseFormatter.error(res, 'Failed to resume subscription', '', 500);
    }
  }

  static async getSubscriptionStatus(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      const subscription = await Subscription.findOne({
        where: { companyId, isActive: true },
        include: [{
          model: PricingPlan,
          as: 'pricingPlan',
        }],
      });

      if (!subscription) {
        return ResponseFormatter.success(
          res,
          { 
            hasSubscription: false,
            status: 'none',
            message: 'No active subscription found'
          },
          'Subscription status retrieved'
        );
      }

      const isTrialActive = subscription.isTrialActive();
      const remainingTrialDays = subscription.getRemainingTrialDays();
      const needsPayment = subscription.needsPayment();

      let statusMessage = '';
      let actionRequired = false;

      switch (subscription.status) {
        case 'trial':
          if (isTrialActive) {
            statusMessage = `Trial active - ${remainingTrialDays} days remaining`;
            actionRequired = remainingTrialDays <= 3;
          } else {
            statusMessage = 'Trial expired - payment required';
            actionRequired = true;
          }
          break;
        case 'active':
          if (needsPayment) {
            statusMessage = 'Payment overdue - please update payment method';
            actionRequired = true;
          } else {
            statusMessage = 'Subscription active';
          }
          break;
        case 'paused':
          statusMessage = 'Subscription paused';
          break;
        case 'cancelled':
          statusMessage = 'Subscription cancelled';
          break;
        case 'expired':
          statusMessage = 'Subscription expired - please renew';
          actionRequired = true;
          break;
      }

      ResponseFormatter.success(
        res,
        {
          hasSubscription: true,
          status: subscription.status,
          isActive: subscription.isActive,
          isTrialActive,
          remainingTrialDays,
          needsPayment,
          actionRequired,
          message: statusMessage,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            trialStartDate: subscription.trialStartDate,
            trialEndDate: subscription.trialEndDate,
            nextBillingDate: subscription.nextBillingDate,
            amount: subscription.amount,
            interval: subscription.interval,
            pricingPlan: (subscription as any).pricingPlan,
          },
        },
        'Subscription status retrieved'
      );
    } catch (error) {
      logger.error('Error fetching subscription status:', error);
      ResponseFormatter.error(res, 'Failed to fetch subscription status', '', 500);
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    try {
      const webhookData = req.body;
      const razorpayService = new RazorpayService();

      // Verify webhook signature (in production, you should verify this)
      // const signature = req.headers['x-razorpay-signature'];
      // const isValid = razorpayService.verifyWebhookSignature(JSON.stringify(webhookData), signature);
      // if (!isValid) {
      //   return ResponseFormatter.error(res, 'Invalid webhook signature', '', 401);
      // }

      const { event, payload } = webhookData;

      switch (event) {
        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload);
          break;
        case 'subscription.completed':
          await this.handleSubscriptionCompleted(payload);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'subscription.paused':
          await this.handleSubscriptionPaused(payload);
          break;
        case 'subscription.resumed':
          await this.handleSubscriptionResumed(payload);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;
        default:
          logger.info('Unhandled webhook event:', event);
      }

      ResponseFormatter.success(res, null, 'Webhook processed successfully');
    } catch (error) {
      logger.error('Error processing webhook:', error);
      ResponseFormatter.error(res, 'Failed to process webhook', '', 500);
    }
  }

  private static async handleSubscriptionActivated(payload: any) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id },
    });

    if (subscription) {
      await subscription.update({
        status: 'active',
        subscriptionStartDate: new Date(payload.subscription.current_start * 1000),
        subscriptionEndDate: new Date(payload.subscription.current_end * 1000),
        nextBillingDate: new Date(payload.subscription.current_end * 1000),
      });

      // Log subscription activation
      await SubscriptionHistoryService.createHistoryEvent({
        subscriptionId: subscription.id,
        companyId: subscription.companyId,
        eventType: 'reactivated',
        previousStatus: 'trial',
        newStatus: 'active',
        razorpayEventId: payload.id,
        description: 'Subscription activated after trial',
        metadata: {
          razorpayEvent: payload,
          activatedAt: new Date(),
        },
      });

      logger.info(`Subscription ${subscription.id} activated`);
    }
  }

  private static async handleSubscriptionCompleted(payload: any) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id },
    });

    if (subscription) {
      await subscription.update({
        status: 'expired',
        isActive: false,
      });
      logger.info(`Subscription ${subscription.id} completed`);
    }
  }

  private static async handleSubscriptionCancelled(payload: any) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id },
    });

    if (subscription) {
      await subscription.update({
        status: 'cancelled',
        isActive: false,
      });
      logger.info(`Subscription ${subscription.id} cancelled`);
    }
  }

  private static async handleSubscriptionPaused(payload: any) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id },
    });

    if (subscription) {
      await subscription.update({
        status: 'paused',
      });
      logger.info(`Subscription ${subscription.id} paused`);
    }
  }

  private static async handleSubscriptionResumed(payload: any) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id },
    });

    if (subscription) {
      await subscription.update({
        status: 'active',
      });
      logger.info(`Subscription ${subscription.id} resumed`);
    }
  }

  private static async handlePaymentFailed(payload: any) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id },
    });

    if (subscription) {
      await subscription.update({
        failedPaymentAttempts: subscription.failedPaymentAttempts + 1,
      });

      // Log payment failure
      await SubscriptionHistoryService.logPaymentFailure(
        subscription,
        payload.id,
        payload.error?.description
      );

      // Deactivate account after 3 failed attempts
      if (subscription.failedPaymentAttempts >= 3) {
        await subscription.update({
          isActive: false,
          status: 'expired',
        });

        // Log subscription expiry
        await SubscriptionHistoryService.logSubscriptionExpired(subscription);

        logger.info(`Subscription ${subscription.id} deactivated due to payment failures`);
      }
    }
  }

  private static async handlePaymentCaptured(payload: any) {
    const subscription = await Subscription.findOne({
      where: { razorpaySubscriptionId: payload.subscription.id },
    });

    if (subscription) {
      await subscription.update({
        lastPaymentDate: new Date(),
        failedPaymentAttempts: 0,
        nextPaymentDate: new Date(payload.subscription.current_end * 1000),
      });

      // Log successful payment
      await SubscriptionHistoryService.logPaymentSuccess(
        subscription,
        payload.payment.amount / 100, // Convert from paise to rupees
        payload.payment.id,
        'razorpay',
        payload.id
      );

      logger.info(`Payment captured for subscription ${subscription.id}`);
    }
  }
}
