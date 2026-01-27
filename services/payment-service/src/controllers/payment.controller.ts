import { Request, Response, NextFunction } from 'express';
// import { ResponseFormatter } from '@hrm/common'; // Assuming this exists, based on employee-service
import { PaymentService } from '../services/payment.service';

const paymentService = new PaymentService();

// Mock ResponseFormatter if not available or import fails
const ResponseFormatter = {
  success: (
    res: Response,
    data: any,
    message: string = 'Success',
    details: string | null = null,
    statusCode: number = 200
  ) => {
    res.status(statusCode).json({
      success: true,
      data,
      message,
      details,
    });
  },
  error: (res: Response, message: string, error: any, statusCode: number = 500) => {
    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error,
    });
  },
};

export class PaymentController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, currency, receipt, notes, customerName, customerEmail, customerPhone } =
        req.body;

      if (!amount) {
        return ResponseFormatter.error(res, 'Amount is required', null, 400);
      }

      const result = await paymentService.createOrder({
        amount,
        currency,
        receipt,
        notes,
        customerName,
        customerEmail,
        customerPhone,
      });

      ResponseFormatter.success(res, result, 'Order created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return ResponseFormatter.error(res, 'Missing payment verification details', null, 400);
      }

      const result = await paymentService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      ResponseFormatter.success(res, result, 'Payment verified successfully');
    } catch (error) {
      next(error);
    }
  }
}
