import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

export default function TrackOrderPage() {
  const params = useParams();
  const { orderId } = params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Shiprocket tracking state
  const [tracking, setTracking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // fetch basic order info
        const resOrder = await apiRequest("GET", `/api/orders/${orderId}`);
        const orderData = await resOrder.json();
        setOrder(orderData.order || orderData);
        // fetch tracking info
        const resTrack = await apiRequest("GET", `/api/orders/${orderId}/track`);
        const trackData = await resTrack.json();
        setTracking(trackData.data || trackData);
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [orderId]);

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (error) return <div className="container mx-auto p-8">Error: {error}</div>;
  if (!order) return <div className="container mx-auto p-8">Order not found.</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-heading mb-4">Track Order</h1>
      <p><b>Order ID:</b> {order.id}</p>
      <p><b>Status:</b> {order.status}</p>
      <h2 className="mt-6 text-lg font-medium">Shipment Tracking Details</h2>
      {tracking ? (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(tracking, null, 2)}</pre>
      ) : (
        <p>No tracking information available.</p>
      )}
      <Button asChild className="mt-4">
        <a href="/account">Back to Account</a>
      </Button>
    </div>
  );
}
