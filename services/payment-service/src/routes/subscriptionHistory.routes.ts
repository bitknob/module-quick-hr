import { Router } from 'express';
import { SubscriptionHistoryController } from '../controllers/subscriptionHistory.controller';
import { getAuthMiddleware } from '@hrm/common';

const router = Router();
const { authenticate, authorize } = getAuthMiddleware();

// Protected routes - require authentication
router.get('/subscription/:subscriptionId', authenticate, SubscriptionHistoryController.getSubscriptionHistory);
router.get('/company/:companyId', authenticate, SubscriptionHistoryController.getCompanySubscriptionHistory);
router.get('/subscription/:subscriptionId/payments', authenticate, SubscriptionHistoryController.getPaymentHistory);
router.get('/subscription/:subscriptionId/events', authenticate, SubscriptionHistoryController.getEventsByType);
router.get('/company/:companyId/recent', authenticate, SubscriptionHistoryController.getRecentEvents);
router.get('/subscription/:subscriptionId/statistics', authenticate, SubscriptionHistoryController.getSubscriptionStatistics);
router.get('/company/:companyId/payment-summary', authenticate, authorize('admin'), SubscriptionHistoryController.getCompanyPaymentSummary);

export default router;
