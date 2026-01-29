import { Router } from 'express';
import { PricingPlanController } from '../controllers/pricingPlan.controller';
import { getAuthMiddleware } from '@hrm/common';

const router = Router();
const { authenticate, authorize } = getAuthMiddleware();

// Public routes - get pricing plans
router.get('/', PricingPlanController.getAllPricingPlans);
router.get('/:id', PricingPlanController.getPricingPlanById);

// Protected routes - require authentication and admin role
router.post('/', authenticate, authorize('admin'), PricingPlanController.createPricingPlan);
router.put('/:id', authenticate, authorize('admin'), PricingPlanController.updatePricingPlan);
router.delete('/:id', authenticate, authorize('admin'), PricingPlanController.deletePricingPlan);
router.patch('/:id/toggle', authenticate, authorize('admin'), PricingPlanController.togglePricingPlanStatus);

export default router;
