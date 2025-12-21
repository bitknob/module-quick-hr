import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as arrearsController from '../controllers/arrears.controller';

const router = Router();

router.post('/', authenticate, arrearsController.createArrears);
router.get('/employee/:employeeId', authenticate, arrearsController.getArrearsByEmployee);
router.get('/:id', authenticate, arrearsController.getArrears);
router.post('/:id/approve', authenticate, arrearsController.approveArrears);

export default router;

