import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as variablePayController from '../controllers/variablePay.controller';

const router = Router();

router.post('/', authenticate, variablePayController.createVariablePay);
router.get('/employee/:employeeId', authenticate, variablePayController.getVariablePayByEmployee);
router.get('/:id', authenticate, variablePayController.getVariablePay);
router.put('/:id', authenticate, variablePayController.updateVariablePay);
router.post('/:id/approve', authenticate, variablePayController.approveVariablePay);

export default router;

