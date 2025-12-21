import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as salaryStructureController from '../controllers/salaryStructure.controller';

const router = Router();

router.post('/', authenticate, salaryStructureController.createSalaryStructure);
router.get('/company/:companyId', authenticate, salaryStructureController.getSalaryStructuresByCompany);
router.get('/:id', authenticate, salaryStructureController.getSalaryStructure);
router.put('/:id', authenticate, salaryStructureController.updateSalaryStructure);

router.post('/:id/components', authenticate, salaryStructureController.addComponent);
router.put('/components/:id', authenticate, salaryStructureController.updateComponent);
router.delete('/components/:id', authenticate, salaryStructureController.deleteComponent);

router.post('/assign', authenticate, salaryStructureController.assignSalaryStructure);
router.get('/employee/:employeeId', authenticate, salaryStructureController.getEmployeeSalaryStructure);

export default router;

