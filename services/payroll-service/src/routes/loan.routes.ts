import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as loanController from '../controllers/loan.controller';

const router = Router();

router.post('/', authenticate, loanController.createLoan);
router.get('/calculate-emi', authenticate, loanController.calculateEMI);
router.get('/employee/:employeeId/active', authenticate, loanController.getActiveLoansByEmployee);
router.get('/:id', authenticate, loanController.getLoan);
router.post('/:id/close', authenticate, loanController.closeLoan);

export default router;

