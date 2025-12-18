import { Router } from 'express';
import {
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  uploadCompanyProfileImage,
} from '../controllers/company.controller';
import { getAuthMiddleware, UserRole, profileImageUploadMiddleware } from '@hrm/common';
import { enrichEmployeeContext, checkCompanyAccess } from '../middleware/accessControl';

const { authenticate, authorize } = getAuthMiddleware();

const router = Router();

router.use(authenticate);
router.use(enrichEmployeeContext);

router.get(
  '/',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  getAllCompanies
);

router.get(
  '/:id',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  getCompany
);

router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN),
  createCompany
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN),
  updateCompany
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN),
  deleteCompany
);

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

