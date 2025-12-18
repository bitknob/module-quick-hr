import { Router } from 'express';
import {
  signup,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  getCurrentUser,
} from '../controllers/auth.controller';
import { getMenu } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@hrm/common';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

router.use(authenticate);

router.get('/me', getCurrentUser);
router.get('/menu', getMenu);
router.post('/change-password', changePassword);

export default router;
