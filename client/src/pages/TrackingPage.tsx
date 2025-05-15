import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const TrackingPage = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validation
      if (!orderId || !email) {
        setError("Please enter both Order ID and Email.");
        toast({
          title: "Missing Information",
          description: "Both Order ID and Email are required to track your order.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Here you would call the Shiprocket API or your backend endpoint
      // For now, we'll simulate with dummy data
      // Replace this with actual API integration
      const response = await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tracking information.");
      }

      const data = await response.json();
      setTrackingData(data);
      toast({
        title: "Tracking Information Retrieved",
        description: `Tracking details for Order ${orderId} have been successfully retrieved.`,
      });
    } catch (err) {
      setError("Failed to track order. Please check your details and try again.");
      toast({
        title: "Error",
        description: "Could not retrieve tracking information. Please verify your Order ID and Email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Dummy data for UI demonstration
  const dummyTrackingData = {
    order_id: orderId || "ORD123456",
    shipment_status: "In Transit",
    last_updated: new Date().toISOString(),
    estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    current_location: "Distribution Center, Mumbai",
    shipment_history: [
      {
        status: "Order Placed",
        location: "Online Store",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: "Processing",
        location: "Warehouse, Delhi",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: "Shipped",
        location: "Warehouse, Delhi",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        status: "In Transit",
        location: "Distribution Center, Mumbai",
        date: new Date().toISOString(),
      },
    ],
  };

  const displayData = trackingData || (orderId && email && !error && !loading ? dummyTrackingData : null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order details to track your shipment status.</p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <Input
                  id="orderId"
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your Order ID"
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email"
                  className="w-full"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white py-3 text-base font-medium"
              disabled={loading}
            >
              {loading ? "Tracking..." : "Track Order"}
            </Button>
          </form>
        </div>

        {/* Tracking Results */}
        {displayData && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Tracking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium">{displayData.order_id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Shipment Status</p>
                <p className="font-medium text-green-600">{displayData.shipment_status}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-medium">{format(new Date(displayData.estimated_delivery), "MMM d, yyyy")}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">Last Updated: {format(new Date(displayData.last_updated), "MMM d, yyyy h:mm a")}</p>
              <p className="text-sm text-gray-600">Current Location: {displayData.current_location}</p>
            </div>

            <div className="border-l-2 border-gray-200 pl-4 ml-3 relative before:absolute before:w-3 before:h-3 before:rounded-full before:bg-green-500 before:-left-[6px] before:top-0 after:absolute after:w-3 after:h-3 after:rounded-full after:bg-gray-300 after:-left-[6px] after:bottom-0">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipment History</h3>
              <div className="space-y-6">
                {displayData.shipment_history.map((history: any, index: number) => (
                  <div key={index} className="relative before:absolute before:w-2 before:h-2 before:rounded-full before:bg-gray-400 before:-left-[29px] before:top-1.5">
                    <p className="font-medium text-gray-900">{history.status}</p>
                    <p className="text-sm text-gray-600">{history.location}</p>
                    <p className="text-sm text-gray-500">{format(new Date(history.date), "MMM d, yyyy h:mm a")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
