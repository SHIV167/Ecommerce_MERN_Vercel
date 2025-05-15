export {};

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Allow import of react-date-range without types
declare module 'react-date-range';
