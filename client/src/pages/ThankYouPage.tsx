import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export default function ThankYouPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiRequest('GET', `/api/orders/${orderId}`);
        const data = (await res.json()) as { order: Order; items: OrderItem[] };
        setOrder(data.order);
        setItems(data.items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [orderId]);

  if (loading) return <div className="container mx-auto p-8 text-center">Loading your order...</div>;
  if (!order) return <div className="container mx-auto p-8 text-center">Order not found.</div>;

  return (
    <>
      <Helmet>
        <title>{`Thank You - Order ${order.id}`}</title>
      </Helmet>
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-heading text-primary mb-4">Thank You for Your Order!</h1>
        <p className="mb-6">Your order <strong>#{order.id}</strong> has been placed successfully on {new Date(order.createdAt).toLocaleString()}.</p>
        <div className="mb-6">
          <h2 className="font-heading text-lg">Order Details</h2>
          <p><strong>Total:</strong> {formatCurrency(order.totalAmount)}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
        </div>
        <div className="mb-6">
          <h2 className="font-heading text-lg">Items</h2>
          <ul>
            {items.map(i => (
              <li key={i.id} className="py-2 border-b">
                {i.quantity} × {i.productId} &mdash; {formatCurrency(i.price)} each
              </li>
            ))}
          </ul>
        </div>
        <Link href="/">
          <a className="inline-block bg-primary hover:bg-primary-light text-white py-2 px-4 rounded">Continue Shopping</a>
        </Link>
      </div>
    </>
  );
}
