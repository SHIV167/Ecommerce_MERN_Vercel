import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCoupon } from "@/hooks/useCoupon";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CouponForm } from "@/components/coupon/CouponForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Helmet } from 'react-helmet';
import RazorpayCheckout from '../components/RazorpayCheckout';
import { Label } from "@/components/ui/label";
import { Switch as UiSwitch } from "@/components/ui/switch";
import AuthModal from '@/components/common/AuthModal';

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  paymentMethod: z.enum(["card", "upi", "cod"]),
  sameAsBilling: z.boolean().default(true),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingZipCode: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<{orderId:string;amount:number;currency:string} | null>(null);
  const [pendingOrderPayload, setPendingOrderPayload] = useState<any>(null);
  const [shippingCheck, setShippingCheck] = useState<{serviceable: boolean; details: any} | null>(null);
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [shippingWeight, setShippingWeight] = useState(1);
  const [shippingCodFlag, setShippingCodFlag] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { cartItems, subtotal, clearCart, isEmpty } = useCart();
  const { appliedCoupon, applyCoupon, removeCoupon, calculateDiscountedTotal } = useCoupon();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      paymentMethod: "card",
      sameAsBilling: true,
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZipCode: "",
    }
  });
  
  const sameAsBilling = form.watch("sameAsBilling");
  const paymentMethod = form.watch("paymentMethod");
  
  // Automatically refresh form values when user logs in/registers
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        paymentMethod: "card",
        sameAsBilling: true,
        shippingAddress: "",
        shippingCity: "",
        shippingState: "",
        shippingZipCode: "",
      });
    }
  }, [user]);

  // Calculate final total with discount
  const finalTotal = calculateDiscountedTotal(subtotal);

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    // Update to use finalTotal which includes any applied discounts
    const totalAmount = finalTotal + (finalTotal > 500 ? 0 : 50) + finalTotal * 0.18;
    const payload = {
      order: {
        userId: user?.id || '',
        status: 'pending',
        totalAmount,
        // Billing fields from checkout form
        billingCustomerName: values.name,
        billingLastName: '', // split if you have first/last
        billingAddress: values.address,
        billingCity: values.city,
        billingState: values.state,
        billingPincode: values.zipCode,
        billingEmail: values.email,
        billingPhone: values.phone,
        // Shipping fields
        shippingIsBilling: values.sameAsBilling,
        shippingAddress: values.sameAsBilling ? values.address : (values.shippingAddress || ''),
        shippingCity: values.sameAsBilling ? values.city : (values.shippingCity || ''),
        shippingState: values.sameAsBilling ? values.state : (values.shippingState || ''),
        shippingPincode: values.sameAsBilling ? values.zipCode : (values.shippingZipCode || ''),
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentMethod === 'cod' ? 'unpaid' : 'pending',
        // Coupon and discount
        couponCode: appliedCoupon?.code || null,
        discountAmount: appliedCoupon?.discountValue || 0,
      },
      items: cartItems.map(i => ({ productId: i.product._id!, quantity: i.quantity, price: i.product.price })),
    };
    if (values.paymentMethod === 'cod') {
      try {
        // Dev: skip serviceability; place COD order directly
        const res = await apiRequest('POST', '/api/orders', payload);
        const data = await res.json() as { order: { id: string }; items: any[] };
        const orderId = data.order.id;
        toast({ title: 'Order placed!', description: `Your order #${orderId} has been placed.` });
        clearCart();
        navigate(`/thank-you/${orderId}`);
      } catch (error) {
        console.error('Checkout error:', error);
        toast({ title: 'Order failed', variant: 'destructive' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    try {
      const { orderId, amount: amt, currency: curr } = await apiRequest('POST','/api/razorpay/order',{ amount: Math.round(totalAmount*100), currency: 'INR' }).then(r=>r.json());
      setPendingOrderPayload(payload);
      setRazorpayOrder({ orderId, amount: amt, currency: curr });
    } catch (err) {
      console.error('Payment init error:', err);
      toast({ title: 'Payment init failed', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-heading text-primary mb-4">Your cart is empty</h1>
        <p className="text-neutral-gray mb-8">You need to add items to your cart before checking out.</p>
        <Button 
          asChild
          className="bg-primary hover:bg-primary-light text-white"
        >
          <Link href="/collections/all">Shop Now</Link>
        </Button>
      </div>
    );
  }

  if (razorpayOrder && pendingOrderPayload) {
    return (
      <>
        <Helmet>
          <title>Complete Payment | Kama Ayurveda</title>
        </Helmet>
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
            <img src="/uploads/logo.svg" alt="Kama Ayurveda" className="h-10 mx-auto mb-6" />
            <h1 className="text-2xl font-heading text-primary mb-4">Complete Your Purchase</h1>
            <p className="text-gray-600 mb-6">Please complete your payment to finalize your order.</p>
            
            <div className="bg-neutral-cream p-4 rounded-md mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="font-heading text-xl text-primary">
                  {formatCurrency(razorpayOrder.amount/100)}
                </span>
              </div>
            </div>
            
            <RazorpayCheckout
              orderId={razorpayOrder.orderId}
              amount={razorpayOrder.amount}
              currency={razorpayOrder.currency}
              onSuccess={async res => {
                setIsSubmitting(true);
                try {
                  const valid = await apiRequest('POST','/api/razorpay/verify',res).then(r=>r.json());
                  if (!valid.valid) throw new Error('Invalid');
                  pendingOrderPayload.order.paymentStatus = 'paid';
                  pendingOrderPayload.order.paymentId = res.razorpay_payment_id;
                  const data = await apiRequest('POST','/api/orders',pendingOrderPayload).then(r=>r.json());
                  const orderId = data.order.id;
                  toast({ title: 'Payment successful!', description: `Your order #${orderId} has been placed.` });
                  clearCart();
                  navigate(`/thank-you/${orderId}`);
                } catch {
                  toast({ title: 'Payment failed', variant: 'destructive' });
                  // Reset payment state if payment fails
                  setRazorpayOrder(null);
                  setPendingOrderPayload(null);
                } finally { 
                  setIsSubmitting(false); 
                }
              }}
              onError={err => {
                toast({ title: 'Payment error', description: err.error?.description||err.message, variant: 'destructive' });
                // Reset payment state when payment is canceled or errors out
                setRazorpayOrder(null);
                setPendingOrderPayload(null);
                setIsSubmitting(false);
              }}
            />
            
            <button 
              onClick={() => {
                setRazorpayOrder(null);
                setPendingOrderPayload(null);
                setIsSubmitting(false);
              }}
              className="mt-4 text-gray-600 hover:text-primary underline text-sm"
            >
              Cancel and return to checkout
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Kama Ayurveda</title>
        <meta name="description" content="Complete your purchase securely." />
      </Helmet>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      
      <div className="bg-neutral-50 py-10 mt-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back button */}
          <Link href="/cart" className="flex items-center text-sm text-gray-600 mb-6">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            BACK
          </Link>
          
          {/* Login prompt - only shown if not authenticated */}
          {!isAuthenticated && (
            <div className="bg-gray-50 p-4 mb-8 rounded border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm">To use Amaaya points, vouchers, please log in</span>
                <button 
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-neutral-800 text-white text-xs px-4 py-2 uppercase tracking-wider"
                >
                  LOGIN
                </button>
              </div>
            </div>
          )}
          
          {/* Promotional banner */}
          <div className="bg-amber-50 p-4 mb-8 rounded border border-amber-100">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 118 0v7M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <p className="text-sm">Add products worth Rs. 2000 and Choose any 2 complimentary gifts worth up to Rs. 1990 on orders above Rs 3000.</p>
            </div>
          </div>
          
          {/* Main checkout form and order summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="border border-neutral-sand rounded-md overflow-hidden">
                    <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                      <h2 className="font-heading text-lg text-primary">Billing Information</h2>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="1234 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Mumbai" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="Maharashtra" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zip code</FormLabel>
                              <FormControl>
                                <Input placeholder="Zip code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="sameAsBilling"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Shipping address is the same as billing address</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {!sameAsBilling && (
                        <div className="border-t border-neutral-sand pt-6 space-y-6">
                          <h3 className="font-heading text-primary">Shipping Information</h3>
                          
                          <FormField
                            control={form.control}
                            name="shippingAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shipping Address</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="1234 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                              control={form.control}
                              name="shippingCity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Mumbai" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="shippingState"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Maharashtra" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="shippingZipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Zip code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Zip code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-neutral-sand rounded-md overflow-hidden">
                    <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                      <h2 className="font-heading text-lg text-primary">Payment Method</h2>
                    </div>
                    <div className="p-6">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex flex-col space-y-3"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="card" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Credit / Debit Card
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="upi" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    UPI
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="cod" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Cash on Delivery
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-light text-white uppercase tracking-wider py-6 font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
            
            <div className="lg:col-span-1">
              <div className="border border-neutral-sand rounded-md overflow-hidden sticky top-20">
                <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                  <h2 className="font-heading text-lg text-primary">Order Summary</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Product List */}
                    <div className="divide-y divide-neutral-sand">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-4">
                          {item.product?.imageUrl && (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-20 h-20 object-cover rounded bg-neutral-50"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 leading-snug mb-1">
                              {item.product?.name}
                            </h4>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500 bg-neutral-50 px-2 py-1 rounded">
                                Qty: {item.quantity}
                              </span>
                              {item.product?.isFreeProduct && (
                                <span className="text-xs text-primary bg-primary/5 px-2 py-1 rounded font-medium">
                                  Free Gift
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.product?.isFreeProduct ? (
                                <span className="text-primary">Free</span>
                              ) : (
                                formatCurrency((item.product?.price ?? 0) * item.quantity)
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-gray">Subtotal</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    {/* Add Coupon Form */}
                    <CouponForm
                      cartTotal={subtotal}
                      onCouponApplied={applyCoupon}
                      onCouponRemoved={removeCoupon}
                      appliedCoupon={appliedCoupon}
                    />
                    
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(appliedCoupon.discountValue)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-gray">Shipping</span>
                      <span>{finalTotal > 500 ? "Free" : formatCurrency(50)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-gray">Tax (18%)</span>
                      <span>{formatCurrency(finalTotal * 0.18)}</span>
                    </div>
                    
                    <div className="border-t border-neutral-sand pt-4 flex justify-between items-center">
                      <span className="font-heading text-primary">Total</span>
                      <span className="font-heading text-xl text-primary">
                        {formatCurrency(finalTotal + (finalTotal > 500 ? 0 : 50) + finalTotal * 0.18)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Footer */}
      <footer className="bg-white py-6 border-t mt-12">
        <div className="container mx-auto flex justify-center items-center space-x-6">
          <img src="/uploads/payment.svg" alt="Visa" className="h-6" />
          {/* <img src="/icons/mastercard.svg" alt="Mastercard" className="h-6" />
          <img src="/icons/paypal.svg" alt="PayPal" className="h-6" /> */}
        </div>
      </footer>
    </>
  );
}
