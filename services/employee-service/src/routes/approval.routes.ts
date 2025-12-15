import { Router } from 'express';
import { ApprovalController } from '../controllers/approval.controller';
import { getAuthMiddleware } from '@hrm/common';
import { enrichEmployeeContext, checkCompanyAccess } from '../middleware/accessControl';

const router = Router();
const { authenticate } = getAuthMiddleware();

router.use(authenticate);
router.use(enrichEmployeeContext);
router.use(checkCompanyAccess());

router.post('/', ApprovalController.createApprovalRequest);
router.get('/', ApprovalController.getApprovalRequests);
router.get('/pending', ApprovalController.getPendingApprovals);
router.get('/:id', ApprovalController.getApprovalRequest);
router.post('/:id/approve', ApprovalController.approveRequest);
router.post('/:id/reject', ApprovalController.rejectRequest);
router.post('/:id/cancel', ApprovalController.cancelRequest);

export default router;

