import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

router.post('/orders', PaymentController.createOrder);
router.post('/verify', PaymentController.verifyPayment);

export default router;
