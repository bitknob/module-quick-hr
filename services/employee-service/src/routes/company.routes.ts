import { Router } from 'express';
import { uploadCompanyProfileImage } from '../controllers/company.controller';
import { getAuthMiddleware, UserRole, profileImageUploadMiddleware } from '@hrm/common';
import { enrichEmployeeContext, checkCompanyAccess } from '../middleware/accessControl';

const { authenticate, authorize } = getAuthMiddleware();

const router = Router();

router.use(authenticate);
router.use(enrichEmployeeContext);

router.post(
  '/:companyId/upload-profile-image',
  checkCompanyAccess(),
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  profileImageUploadMiddleware,
  uploadCompanyProfileImage
);

export default router;

