import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as taxConfigurationController from '../controllers/taxConfiguration.controller';

const router = Router();

router.post('/', authenticate, taxConfigurationController.createTaxConfiguration);
router.get('/company/:companyId', authenticate, taxConfigurationController.getTaxConfigurationsByCompany);
router.get('/company/:companyId/country/:country/year/:financialYear', authenticate, taxConfigurationController.getTaxConfigurationByCompanyAndYear);
router.get('/:id', authenticate, taxConfigurationController.getTaxConfiguration);
router.put('/:id', authenticate, taxConfigurationController.updateTaxConfiguration);

export default router;

