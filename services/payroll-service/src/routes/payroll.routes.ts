import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as payrollController from '../controllers/payroll.controller';

const router = Router();

router.post('/runs', authenticate, payrollController.createPayrollRun);
router.get('/runs/company/:companyId', authenticate, payrollController.getPayrollRunsByCompany);
router.get('/runs/:id', authenticate, payrollController.getPayrollRun);
router.post('/runs/:id/process', authenticate, payrollController.processPayrollRun);
router.post('/runs/:id/lock', authenticate, payrollController.lockPayrollRun);

router.get('/payslips/:id', authenticate, payrollController.getPayslip);
router.get('/payslips/employee/:employeeId', authenticate, payrollController.getPayslipsByEmployee);
router.get('/payslips/run/:payrollRunId', authenticate, payrollController.getPayslipsByPayrollRun);

export default router;

