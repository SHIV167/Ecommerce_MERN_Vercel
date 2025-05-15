import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface RazorpayCheckoutProps {
  orderId: string;
  amount: number; // in paise, e.g. ₹100 => 10000
  currency?: string;
  onSuccess: (payment: any) => void;
  onError?: (error: any) => void;
}

// Load Razorpay checkout script once
const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-script')) {
      resolve(); return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
};

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({ orderId, amount, currency = 'INR', onSuccess, onError }) => {
  const [sdkReady, setSdkReady] = useState(false);
  useEffect(() => {
    loadRazorpayScript()
      .then(() => setSdkReady(true))
      .catch(err => console.error(err));
  }, []);

  // Auto-open Razorpay checkout when SDK is ready
  useEffect(() => {
    if (sdkReady) {
      handlePayment();
    }
  }, [sdkReady]);

  const handlePayment = async () => {
    if (!sdkReady) {
      console.error('Razorpay SDK not loaded');
      return;
    }
    try {
      const cfg = await apiRequest('GET', '/api/config').then(res => res.json());
      const options: any = {
        key: cfg.razorpayKeyId,
        amount,
        currency,
        order_id: orderId,
        handler: (response: any) => onSuccess(response),
        prefill: {},
        modal: { ondismiss: () => onError?.({ message: 'Payment popup closed' }) }
      };
      const rzp = new window.Razorpay(options);
      // Ensure success callback is triggered
      rzp.on('payment.success', (response: any) => onSuccess(response));
      // Razorpay opens payment modal
      rzp.open();
    } catch (err) {
      console.error('Razorpay init error:', err);
      onError?.(err);
    }
  };

  return (
    <button onClick={handlePayment} disabled={!sdkReady} className="btn-primary disabled:opacity-50">
      {sdkReady ? `Pay ₹${(amount / 100).toFixed(2)}` : 'Loading...' }
    </button>
  );
};

export default RazorpayCheckout;
