import { Router } from 'express';
import {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller';
import { getAuthMiddleware, UserRole } from '@hrm/common';
import { enrichEmployeeContext } from '../middleware/accessControl';

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
    UserRole.COMPANY_ADMIN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER
  ),
  getAllDepartments
);

router.get(
  '/:id',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.MANAGER
  ),
  getDepartment
);

router.post(
  '/',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  createDepartment
);

router.put(
  '/:id',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  updateDepartment
);

router.delete(
  '/:id',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  deleteDepartment
);

export default router;

