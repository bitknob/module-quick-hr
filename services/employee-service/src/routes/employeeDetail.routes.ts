import { Router } from 'express';
import { getAuthMiddleware } from '@hrm/common';
import {
  createOrUpdateDetail,
  getDetail,
  updateDetail,
  getDetailsByCompany,
} from '../controllers/employeeDetail.controller';

const { authenticate } = getAuthMiddleware();

const router = Router();

router.use(authenticate);

router.get('/company/:companyId', getDetailsByCompany);
router.post('/:employeeId/:companyId', createOrUpdateDetail);
router.get('/:employeeId', getDetail);
router.put('/:employeeId/:companyId', updateDetail);

export default router;

