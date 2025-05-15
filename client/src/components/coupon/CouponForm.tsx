import { useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  Tag,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CouponFormProps {
  cartTotal: number;
  onCouponApplied: (couponCode: string, discountAmount: number) => void;
  onCouponRemoved: () => void;
  appliedCoupon: {
    code: string;
    discountValue: number;
  } | null;
}

export function CouponForm({ 
  cartTotal, 
  onCouponApplied, 
  onCouponRemoved,
  appliedCoupon 
}: CouponFormProps) {
  const [couponCode, setCouponCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const applyCoupon = async () => {
    if (!couponCode) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post('/api/coupons/validate', {
        code: couponCode,
        cartValue: cartTotal
      });

      const { coupon, discountValue, message } = response.data;
      
      setSuccessMessage(message);
      onCouponApplied(coupon.code, discountValue);
      
      // Apply the coupon in the backend
      await axios.post('/api/coupons/apply', { code: coupon.code });
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to apply coupon');
      onCouponRemoved();
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setError(null);
    setSuccessMessage(null);
    onCouponRemoved();
  };

  return (
    <div className="mt-4 mb-6">
      <h3 className="font-medium text-sm mb-2 flex items-center">
        <Tag className="w-4 h-4 mr-1.5" /> 
        Apply Promo Code
      </h3>

      {!appliedCoupon ? (
        <div className="flex space-x-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={applyCoupon} 
            disabled={loading || !couponCode}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      ) : (
        <div className="border border-primary-light bg-green-50 rounded-md p-3 flex justify-between items-center">
          <div className="flex items-center">
            <CheckCircle2 className="text-green-600 h-4 w-4 mr-2" />
            <div>
              <p className="text-sm font-medium">{appliedCoupon.code}</p>
              <p className="text-xs text-green-700">Discount applied: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(appliedCoupon.discountValue)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground"
            onClick={removeCoupon}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove coupon</span>
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && !error && (
        <Alert className="mt-2 bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 