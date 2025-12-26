import { Router } from 'express';
import { getAuthMiddleware } from '@hrm/common';
import {
  createLeaveRequest,
  getLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  cancelLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeavesByEmployee,
  getLeavesByCompany,
  getPendingLeavesForApprover,
  searchLeaves,
} from '../controllers/leave.controller';

const { authenticate } = getAuthMiddleware();

const router = Router();

router.use(authenticate);

router.post('/', createLeaveRequest);
router.get('/search', searchLeaves);
router.get('/pending', getPendingLeavesForApprover);
router.get('/employee/:employeeId', getLeavesByEmployee);
router.get('/company/:companyId', getLeavesByCompany);
router.post('/:id/approve', approveLeaveRequest);
router.post('/:id/reject', rejectLeaveRequest);
router.post('/:id/cancel', cancelLeaveRequest);
router.get('/:id', getLeaveRequest);
router.put('/:id', updateLeaveRequest);
router.delete('/:id', deleteLeaveRequest);

export default router;

