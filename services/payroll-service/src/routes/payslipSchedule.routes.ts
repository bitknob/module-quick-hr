import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as payslipScheduleController from '../controllers/payslipSchedule.controller';

const router = Router();

router.post('/', authenticate, payslipScheduleController.createSchedule);
router.get('/company/:companyId', authenticate, payslipScheduleController.getSchedulesByCompany);
router.get('/company/:companyId/logs', authenticate, payslipScheduleController.getGenerationLogs);
router.get('/:id', authenticate, payslipScheduleController.getSchedule);
router.put('/:id', authenticate, payslipScheduleController.updateSchedule);

export default router;

