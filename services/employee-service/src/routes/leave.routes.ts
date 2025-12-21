import { Router } from 'express';
import { authenticate } from '@hrm/common';
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

const router = Router();

router.post('/', authenticate, createLeaveRequest);
router.get('/search', authenticate, searchLeaves);
router.get('/pending', authenticate, getPendingLeavesForApprover);
router.get('/employee/:employeeId', authenticate, getLeavesByEmployee);
router.get('/company/:companyId', authenticate, getLeavesByCompany);
router.post('/:id/approve', authenticate, approveLeaveRequest);
router.post('/:id/reject', authenticate, rejectLeaveRequest);
router.post('/:id/cancel', authenticate, cancelLeaveRequest);
router.get('/:id', authenticate, getLeaveRequest);
router.put('/:id', authenticate, updateLeaveRequest);
router.delete('/:id', authenticate, deleteLeaveRequest);

export default router;

