import { Router } from 'express';
import { authenticate } from '@hrm/common';
import {
  createAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByEmployee,
  getAttendanceByCompany,
  getAttendanceStats,
  checkIn,
  checkOut,
  searchAttendances,
} from '../controllers/attendance.controller';

const router = Router();

router.post('/', authenticate, createAttendance);
router.get('/search', authenticate, searchAttendances);
router.get('/stats/:employeeId/:companyId', authenticate, getAttendanceStats);
router.get('/employee/:employeeId', authenticate, getAttendanceByEmployee);
router.get('/company/:companyId', authenticate, getAttendanceByCompany);
router.post('/checkin/:employeeId/:companyId', authenticate, checkIn);
router.post('/checkout/:employeeId/:companyId', authenticate, checkOut);
router.get('/:id', authenticate, getAttendance);
router.put('/:id', authenticate, updateAttendance);
router.delete('/:id', authenticate, deleteAttendance);

export default router;

