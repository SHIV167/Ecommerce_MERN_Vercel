import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StickyAddToCartProps {
  product: any;
  quantity: number;
  setQuantity: (q: number) => void;
  onAddToCart: () => void;
}

export default function StickyAddToCart({ product, quantity, setQuantity, onAddToCart }: StickyAddToCartProps) {
  const [visible, setVisible] = useState(true);

  // Show only if product is loaded
  if (!product) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-10 md:z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white shadow-2xl border border-neutral-sand rounded-t-xl flex items-center gap-2 md:gap-4 px-2 md:px-6 py-2 md:py-4 w-full max-w-2xl mx-auto pointer-events-auto animate-slideup">
        <img
          src={product.images?.[0] || product.imageUrl}
          alt={product.name}
          className="hidden md:block w-10 h-10 md:w-14 md:h-14 rounded object-cover border"
        />
        <div className="hidden md:block flex-1 min-w-0">
          <div className="font-semibold truncate text-base text-primary">{product.name}</div>
          <div className="text-base font-bold text-green-700 md:text-lg">₹{product.price}</div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-bold text-primary border hover:bg-neutral-200"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            type="button"
          >-</button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-bold text-primary border hover:bg-neutral-200"
            onClick={() => setQuantity(Math.min(10, quantity + 1))}
            aria-label="Increase quantity"
            type="button"
          >+</button>
        </div>
        <Button
          size="lg"
          className="h-[80px] md:h-12 ml-0 md:ml-4 px-4 md:px-8 bg-primary hover:bg-primary-dark text-white font-bold shadow-md w-full md:w-auto"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>
      </div>
      <style>{`
        @keyframes slideup {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideup { animation: slideup 0.4s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </div>
  );
}
