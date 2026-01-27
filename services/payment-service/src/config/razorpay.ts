import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const RAZORPAY_MERCHANT_ID = process.env.RAZORPAY_MERCHANT_ID;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('Razorpay API keys are missing in environment variables.');
  // We don't exit here to avoid crashing the service on startup during build,
  // but it will fail when used
}

export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || '',
  key_secret: RAZORPAY_KEY_SECRET,
});

export const RAZORPAY_CONFIG = {
  merchantId: RAZORPAY_MERCHANT_ID,
  keyId: RAZORPAY_KEY_ID,
  keySecret: RAZORPAY_KEY_SECRET,
};
