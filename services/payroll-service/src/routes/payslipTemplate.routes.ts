import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as payslipTemplateController from '../controllers/payslipTemplate.controller';

const router = Router();

router.post('/', authenticate, payslipTemplateController.createTemplate);
router.get('/company/:companyId', authenticate, payslipTemplateController.getTemplatesByCompany);
router.get('/:id', authenticate, payslipTemplateController.getTemplate);
router.put('/:id', authenticate, payslipTemplateController.updateTemplate);
router.post('/:id/set-default', authenticate, payslipTemplateController.setDefaultTemplate);
router.post('/generate-pdf/:id', authenticate, payslipTemplateController.generatePayslipPDF);

export default router;

