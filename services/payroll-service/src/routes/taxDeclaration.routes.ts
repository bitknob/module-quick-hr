import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as taxDeclarationController from '../controllers/taxDeclaration.controller';

const router = Router();

router.post('/', authenticate, taxDeclarationController.createOrUpdateTaxDeclaration);
router.get('/company/:companyId', authenticate, taxDeclarationController.getTaxDeclarationsByCompany);
router.get('/employee/:employeeId/year/:financialYear', authenticate, taxDeclarationController.getTaxDeclarationByEmployeeAndYear);
router.get('/:id', authenticate, taxDeclarationController.getTaxDeclaration);
router.post('/:id/submit', authenticate, taxDeclarationController.submitTaxDeclaration);
router.post('/:id/verify', authenticate, taxDeclarationController.verifyTaxDeclaration);

export default router;

