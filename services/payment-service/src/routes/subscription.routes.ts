import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { getAuthMiddleware } from '@hrm/common';

const router = Router();
const { authenticate, authorize } = getAuthMiddleware();

// Public routes - get subscription status
router.get('/status/:companyId', SubscriptionController.getSubscriptionStatus);

// Protected routes - require authentication
router.post('/', authenticate, SubscriptionController.createSubscription);
router.get('/:companyId', authenticate, SubscriptionController.getSubscription);
router.put('/:companyId', authenticate, SubscriptionController.updateSubscription);
router.delete('/:companyId', authenticate, authorize('admin'), SubscriptionController.cancelSubscription);
router.patch('/:companyId/pause', authenticate, SubscriptionController.pauseSubscription);
router.patch('/:companyId/resume', authenticate, SubscriptionController.resumeSubscription);

// Webhook endpoint - no authentication required (verified by signature)
router.post('/webhook', SubscriptionController.handleWebhook);

export default router;
