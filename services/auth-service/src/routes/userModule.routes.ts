import { Router } from 'express';
import {
  assignModule,
  getUserModules,
  getAllUserModules,
  getUserModuleById,
  updateUserModule,
  removeUserModule,
  getValidModuleKeys,
} from '../controllers/userModule.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@hrm/common';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN),
  assignModule
);

router.get(
  '/valid-keys',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF),
  getValidModuleKeys
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF),
  getAllUserModules
);

router.get(
  '/user/:userId',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF),
  getUserModules
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN, UserRole.PROVIDER_HR_STAFF),
  getUserModuleById
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN),
  updateUserModule
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN),
  removeUserModule
);

export default router;

