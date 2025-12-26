import { Router } from 'express';
import {
  createEmployee,
  getEmployee,
  getCurrentEmployee,
  updateEmployee,
  deleteEmployee,
  getDirectReports,
  getAllSubordinates,
  getHierarchyTree,
  searchEmployees,
  transferEmployee,
  getCurrentEmployeeDocuments,
  getCurrentEmployeeDetails,
} from '../controllers/employee.controller';
import { getAuthMiddleware, UserRole } from '@hrm/common';
import { enrichEmployeeContext, checkCompanyAccess, checkEmployeeAccess } from '../middleware/accessControl';

const { authenticate, authorize } = getAuthMiddleware();

const router = Router();

router.use(authenticate);
router.use(enrichEmployeeContext);

router.get('/me', getCurrentEmployee);
router.get('/documents', getCurrentEmployeeDocuments);
router.get('/details', getCurrentEmployeeDetails);
router.get('/hierarchy', getHierarchyTree);
router.get('/search', searchEmployees);
router.get('/manager/:managerId/direct-reports', getDirectReports);
router.get('/manager/:managerId/subordinates', getAllSubordinates);
router.get('/:id', checkEmployeeAccess(), getEmployee);
router.post(
  '/',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  createEmployee
);
router.put(
  '/:id',
  checkEmployeeAccess(),
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  updateEmployee
);
router.put(
  '/:id/transfer',
  checkEmployeeAccess(),
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROVIDER_ADMIN,
    UserRole.PROVIDER_HR_STAFF,
    UserRole.HRBP,
    UserRole.COMPANY_ADMIN
  ),
  transferEmployee
);
router.delete(
  '/:id',
  checkEmployeeAccess(),
  authorize(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN),
  deleteEmployee
);

export default router;

