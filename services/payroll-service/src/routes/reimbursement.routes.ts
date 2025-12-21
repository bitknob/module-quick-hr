import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as reimbursementController from '../controllers/reimbursement.controller';

const router = Router();

router.post('/', authenticate, reimbursementController.createReimbursement);
router.get('/employee/:employeeId', authenticate, reimbursementController.getReimbursementsByEmployee);
router.get('/:id', authenticate, reimbursementController.getReimbursement);
router.post('/:id/submit', authenticate, reimbursementController.submitReimbursement);
router.post('/:id/approve', authenticate, reimbursementController.approveReimbursement);
router.post('/:id/reject', authenticate, reimbursementController.rejectReimbursement);

export default router;

