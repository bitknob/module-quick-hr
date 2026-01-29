import { Request, Response } from 'express';
import { z } from 'zod';
import { SubscriptionHistoryService } from '../services/subscriptionHistory.service';
import { ResponseFormatter, logger } from '@hrm/common';

const GetHistorySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const GetPaymentHistorySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const GetEventsByTypeSchema = z.object({
  eventType: z.enum(['created', 'updated', 'cancelled', 'paused', 'resumed', 'payment_successful', 'payment_failed', 'trial_started', 'trial_ended', 'plan_changed', 'reactivated', 'expired']),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export class SubscriptionHistoryController {
  static async getSubscriptionHistory(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const validatedData = GetHistorySchema.parse(req.query);

      const result = await SubscriptionHistoryService.getSubscriptionHistory(
        parseInt(subscriptionId, 10),
        validatedData.limit,
        validatedData.offset
      );

      ResponseFormatter.success(
        res,
        {
          history: result.history,
          pagination: {
            total: result.total,
            limit: validatedData.limit,
            offset: validatedData.offset,
            hasMore: validatedData.offset + validatedData.limit < result.total,
          },
        },
        'Subscription history retrieved successfully'
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

      logger.error('Error fetching subscription history:', error);
      ResponseFormatter.error(res, 'Failed to fetch subscription history', '', 500);
    }
  }

  static async getCompanySubscriptionHistory(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const validatedData = GetHistorySchema.parse(req.query);

      const result = await SubscriptionHistoryService.getCompanySubscriptionHistory(
        companyId,
        validatedData.limit,
        validatedData.offset
      );

      ResponseFormatter.success(
        res,
        {
          history: result.history,
          pagination: {
            total: result.total,
            limit: validatedData.limit,
            offset: validatedData.offset,
            hasMore: validatedData.offset + validatedData.limit < result.total,
          },
        },
        'Company subscription history retrieved successfully'
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

      logger.error('Error fetching company subscription history:', error);
      ResponseFormatter.error(res, 'Failed to fetch company subscription history', '', 500);
    }
  }

  static async getPaymentHistory(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const validatedData = GetPaymentHistorySchema.parse(req.query);

      const result = await SubscriptionHistoryService.getPaymentHistory(
        parseInt(subscriptionId, 10),
        validatedData.limit,
        validatedData.offset
      );

      ResponseFormatter.success(
        res,
        {
          history: result.history,
          pagination: {
            total: result.total,
            limit: validatedData.limit,
            offset: validatedData.offset,
            hasMore: validatedData.offset + validatedData.limit < result.total,
          },
        },
        'Payment history retrieved successfully'
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

      logger.error('Error fetching payment history:', error);
      ResponseFormatter.error(res, 'Failed to fetch payment history', '', 500);
    }
  }

  static async getEventsByType(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const validatedData = GetEventsByTypeSchema.parse(req.query);

      const result = await SubscriptionHistoryService.getEventsByType(
        parseInt(subscriptionId, 10),
        validatedData.eventType,
        validatedData.limit,
        validatedData.offset
      );

      ResponseFormatter.success(
        res,
        {
          history: result.history,
          pagination: {
            total: result.total,
            limit: validatedData.limit,
            offset: validatedData.offset,
            hasMore: validatedData.offset + validatedData.limit < result.total,
          },
        },
        `Events of type ${validatedData.eventType} retrieved successfully`
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

      logger.error('Error fetching events by type:', error);
      ResponseFormatter.error(res, 'Failed to fetch events by type', '', 500);
    }
  }

  static async getRecentEvents(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const events = await SubscriptionHistoryService.getRecentEvents(companyId, limit);

      ResponseFormatter.success(
        res,
        {
          events,
          count: events.length,
        },
        'Recent events retrieved successfully'
      );
    } catch (error) {
      logger.error('Error fetching recent events:', error);
      ResponseFormatter.error(res, 'Failed to fetch recent events', '', 500);
    }
  }

  static async getSubscriptionStatistics(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;

      const statistics = await SubscriptionHistoryService.getSubscriptionStatistics(
        parseInt(subscriptionId, 10)
      );

      ResponseFormatter.success(
        res,
        { statistics },
        'Subscription statistics retrieved successfully'
      );
    } catch (error) {
      logger.error('Error fetching subscription statistics:', error);
      ResponseFormatter.error(res, 'Failed to fetch subscription statistics', '', 500);
    }
  }

  static async getCompanyPaymentSummary(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      // Get all payment events for the company
      const { history } = await SubscriptionHistoryService.getCompanySubscriptionHistory(companyId, 1000, 0);
      
      const paymentEvents = history.filter(event => 
        event.eventType === 'payment_successful' || event.eventType === 'payment_failed'
      );

      const successfulPayments = paymentEvents.filter(event => event.eventType === 'payment_successful');
      const failedPayments = paymentEvents.filter(event => event.eventType === 'payment_failed');

      const totalRevenue = successfulPayments.reduce((sum, event) => sum + (event.amount || 0), 0);
      const averagePaymentAmount = successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0;

      // Group payments by month
      const paymentsByMonth: Record<string, { successful: number; failed: number; revenue: number }> = {};
      
      successfulPayments.forEach(event => {
        const month = new Date(event.createdAt).toISOString().substring(0, 7); // YYYY-MM
        if (!paymentsByMonth[month]) {
          paymentsByMonth[month] = { successful: 0, failed: 0, revenue: 0 };
        }
        paymentsByMonth[month].successful++;
        paymentsByMonth[month].revenue += event.amount || 0;
      });

      failedPayments.forEach(event => {
        const month = new Date(event.createdAt).toISOString().substring(0, 7); // YYYY-MM
        if (!paymentsByMonth[month]) {
          paymentsByMonth[month] = { successful: 0, failed: 0, revenue: 0 };
        }
        paymentsByMonth[month].failed++;
      });

      const summary = {
        totalPayments: paymentEvents.length,
        successfulPayments: successfulPayments.length,
        failedPayments: failedPayments.length,
        totalRevenue,
        averagePaymentAmount,
        successRate: paymentEvents.length > 0 ? (successfulPayments.length / paymentEvents.length) * 100 : 0,
        paymentsByMonth,
        lastPaymentDate: successfulPayments.length > 0 
          ? new Date(Math.max(...successfulPayments.map(e => e.createdAt.getTime())))
          : null,
      };

      ResponseFormatter.success(
        res,
        { summary },
        'Company payment summary retrieved successfully'
      );
    } catch (error) {
      logger.error('Error fetching company payment summary:', error);
      ResponseFormatter.error(res, 'Failed to fetch company payment summary', '', 500);
    }
  }
}
