import { Router } from 'express';
import { getAuthMiddleware } from '@hrm/common';
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

const { authenticate } = getAuthMiddleware();

const router = Router();

router.use(authenticate);

router.post('/', createAttendance);
router.get('/search', searchAttendances);
router.get('/stats/:employeeId/:companyId', getAttendanceStats);
router.get('/employee/:employeeId', getAttendanceByEmployee);
router.get('/company/:companyId', getAttendanceByCompany);
router.post('/checkin/:employeeId/:companyId', checkIn);
router.post('/checkout/:employeeId/:companyId', checkOut);
router.get('/:id', getAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export default router;

