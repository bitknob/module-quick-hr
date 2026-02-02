import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';

const router = Router();

// Public routes - onboarding (no authentication required for initial setup)
router.post('/complete', OnboardingController.completeOnboarding);
router.get('/status/:subscriptionId', OnboardingController.getOnboardingStatus);
router.get('/debug/:subscriptionId', OnboardingController.debugDatabase);

export default router;
