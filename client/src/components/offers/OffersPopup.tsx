import { useState, useEffect, useCallback } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { createPortal } from 'react-dom';

interface OffersPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon: (code: string) => void;
  onApplyVoucher: (code: string) => void;
  openAuthModal: () => void;
}

const OffersPopup: React.FC<OffersPopupProps> = ({ isOpen, onClose, onApplyCoupon, onApplyVoucher, openAuthModal }) => {
  const [couponCode, setCouponCode] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose();
  }, [onClose]);

  // Handle body scroll lock and immediate mounting when popup is open
  useEffect(() => {
    setMounted(true);
    
    if (isOpen) {
      // Apply these changes immediately when opening
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Don't render anything if not open
  if (!isVisible) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex justify-end overflow-hidden">
      <div 
        className="bg-white w-full max-w-md h-full flex flex-col overflow-hidden" 
        style={{
          animation: 'slideInRight 200ms forwards',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Add animation keyframes */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}} />
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-200">
          <button onClick={handleClose} className="text-gray-600 hover:text-primary">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-medium text-primary">Apply Offers</h2>
          <div className="w-5"></div> {/* Empty div for flex alignment */}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Coupon Code Section */}
          <div className="mb-6">
            <div className="flex mb-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter Coupon Code Here"
                className="flex-1 border-r-0 rounded-r-none"
              />
              <Button 
                onClick={() => onApplyCoupon(couponCode)}
                disabled={!couponCode}
                className="bg-white text-primary hover:bg-white border border-l-0 rounded-l-none"
              >
                Apply
              </Button>
            </div>
            
            {/* Voucher Code Section */}
            <div className="flex mb-4">
              <Input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter Voucher Code ex KAMAXXXXXXXX"
                className="flex-1 border-r-0 rounded-r-none"
              />
              <Button 
                onClick={() => onApplyVoucher(voucherCode)}
                disabled={!voucherCode}
                className="bg-white text-primary hover:bg-white border border-l-0 rounded-l-none"
              >
                Apply
              </Button>
            </div>
            
            {/* Login button for non-authenticated users */}
            {!isAuthenticated && (
              <button
                onClick={openAuthModal}
                className="w-full text-center p-4 bg-neutral-100 hover:bg-neutral-200 text-gray-700 mb-4"
              >
                Login to apply code
              </button>
            )}
          </div>
          
          {/* Available Coupons Section */}
          <div className="mb-6">
            <h3 className="font-medium mb-4">Available Coupons</h3>
            <div className="bg-neutral-50 p-6 text-center border border-neutral-200 rounded">
              <p className="text-gray-600">No Coupon Available</p>
            </div>
          </div>
          
          {/* Offers Section */}
          <div>
            <h3 className="font-medium mb-4">Offers</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full">
                    <img src="/uploads/minicart-offer.svg" alt="offer icon" className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-sm">Choose any 2 complimentary gifts worth up to Rs 3990 on orders above Rs 8000.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full">
                    <img src="/uploads/minicart-offer.svg" alt="offer icon" className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-sm">Auto Complimentary NEW Premium Sample on every order!</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full">
                    <img src="/uploads/minicart-offer.svg" alt="offer icon" className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-sm">upto Rs 750 cashback on Freebie's Wallet*</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full">
                    <img src="/uploads/minicart-offer.svg" alt="offer icon" className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-sm">Enjoy 10X Membership Reward+ points on purchases with American Express*</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
  
  return createPortal(content, document.body);
}

export default OffersPopup;
