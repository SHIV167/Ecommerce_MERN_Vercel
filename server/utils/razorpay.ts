import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Validate Razorpay credentials
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
if (!key_id || !key_secret) {
  throw new Error('Razorpay credentials not set. Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
}
const razorpay = new Razorpay({ key_id, key_secret });

export default razorpay;
