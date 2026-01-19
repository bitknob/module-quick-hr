import { Router } from 'express';
import {
  signup,
  login,
  verifyEmail,
  serveVerificationPage,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  getCurrentUser,
  assignUserRole,
  getUserRole,
  getUserRoleByEmail,
  createUserForEmployee,
} from '../controllers/auth.controller';
import { getMenu } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@hrm/common';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.get('/verify-email-page', serveVerificationPage);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

router.use(authenticate);

router.get('/me', getCurrentUser);
router.get('/menu', getMenu);
router.post('/change-password', changePassword);

// Role assignment endpoints
router.post(
  '/assign-role',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN),
  assignUserRole
);
router.get('/users/:userId/role', getUserRole);
router.get('/users/email/:email/role', getUserRoleByEmail);

// Create user account for employee
router.post(
  '/create-user-for-employee',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.COMPANY_ADMIN
  ),
  createUserForEmployee
);

export default router;
