import { useState } from 'react';

interface CouponState {
  code: string;
  discountValue: number;
}

export function useCoupon() {
  const [appliedCoupon, setAppliedCoupon] = useState<CouponState | null>(() => {
    // Check if we have a coupon in localStorage
    const savedCoupon = localStorage.getItem('appliedCoupon');
    return savedCoupon ? JSON.parse(savedCoupon) : null;
  });

  const applyCoupon = (code: string, discountValue: number) => {
    const coupon = { code, discountValue };
    setAppliedCoupon(coupon);
    localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('appliedCoupon');
  };

  const calculateDiscountedTotal = (subtotal: number): number => {
    if (!appliedCoupon) return subtotal;
    
    // Ensure we don't discount below zero
    return Math.max(subtotal - appliedCoupon.discountValue, 0);
  };

  return {
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    calculateDiscountedTotal
  };
} 