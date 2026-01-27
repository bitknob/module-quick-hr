import { razorpay, RAZORPAY_CONFIG } from '../config/razorpay';
import { Payment } from '../models/Payment.model';
import crypto from 'crypto';
import { logger } from '@hrm/common';

interface CreateOrderParams {
  amount: number; // In major unit (e.g. Rupees)
  currency?: string;
  receipt?: string;
  notes?: any;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class PaymentService {
  async createOrder(params: CreateOrderParams) {
    try {
      const {
        amount,
        currency = 'INR',
        receipt,
        notes,
        customerName,
        customerEmail,
        customerPhone,
      } = params;

      const options = {
        amount: Math.round(amount * 100), // Convert to smallest unit (paise)
        currency,
        receipt,
        notes,
      };

      const order = await razorpay.orders.create(options);

      // Save to DB
      const payment = await Payment.create({
        orderId: order.id,
        amount: amount,
        currency: currency,
        status: 'created',
        receipt,
        notes,
        customerName,
        customerEmail,
        customerPhone,
      });

      return {
        order,
        payment,
        keyId: RAZORPAY_CONFIG.keyId, // Send keyId to frontend
      };
    } catch (error) {
      logger.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async verifyPayment(params: VerifyPaymentParams) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    if (!RAZORPAY_CONFIG.keySecret) {
      throw new Error('Razorpay key secret is not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update DB
      const payment = await Payment.findOne({ where: { orderId: razorpay_order_id } });
      if (payment) {
        payment.paymentId = razorpay_payment_id;
        payment.signature = razorpay_signature;
        payment.status = 'paid';
        await payment.save();
      }
      return { success: true, message: 'Payment verified successfully' };
    } else {
      // payment failed verification
      const payment = await Payment.findOne({ where: { orderId: razorpay_order_id } });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
      throw new Error('Invalid signature');
    }
  }
}
