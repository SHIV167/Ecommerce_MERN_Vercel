import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrdersManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<string>("");
  const [packageLength, setPackageLength] = useState<string>("");
  const [packageBreadth, setPackageBreadth] = useState<string>("");
  const [packageHeight, setPackageHeight] = useState<string>("");
  const [packageWeight, setPackageWeight] = useState<string>("");

  const limit = 10;

  const apiBase = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '');

  // Fetch orders
  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['orders', page, limit, search, statusFilter, dateFilter],
    queryFn: async () => {
      let url = `${apiBase}/api/orders?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter && statusFilter !== "all") url += `&status=${statusFilter}`;
      if (dateFilter && dateFilter !== "all") url += `&date=${dateFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });

  // Defensive extraction of orders and pagination info
  const orders = Array.isArray(ordersData?.orders) ? ordersData.orders : [];
  const total = typeof ordersData?.total === 'number' ? ordersData.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // --- Map backend _id to id for all orders to ensure consistent usage in frontend ---
  const normalizedOrders = orders.map((order: any) => ({
    ...order,
    id: order.id || order._id || '',
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page when searching
  };

  const handleViewOrder = (order: Order) => {
    setPackageLength(order.packageLength?.toString() || "");
    setPackageBreadth(order.packageBreadth?.toString() || "");
    setPackageHeight(order.packageHeight?.toString() || "");
    setPackageWeight(order.packageWeight?.toString() || "");
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${apiBase}/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          packageLength: packageLength ? Number(packageLength) : undefined,
          packageBreadth: packageBreadth ? Number(packageBreadth) : undefined,
          packageHeight: packageHeight ? Number(packageHeight) : undefined,
          packageWeight: packageWeight ? Number(packageWeight) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      setIsOrderDetailsOpen(false);
      window.location.reload(); // Or refetch orders if you want a better UX
    },
  });

  const handleUpdateOrder = () => {
    if (selectedOrder && statusToUpdate) {
      updateOrderMutation.mutate({ id: String(selectedOrder.id), status: statusToUpdate });
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusToUpdate(value);
  };

  const handleExportCSV = () => {
    if (!orders.length) return;
    const header = ["Order ID", "Customer", "Date", "Status", "Total", "Length", "Breadth", "Height", "Weight"];
    const rows = orders.map((order: Order) => [
      order.id,
      order.userId,
      formatDate(String(order.createdAt)),
      order.status,
      typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00',
      order.packageLength ?? '-',
      order.packageBreadth ?? '-',
      order.packageHeight ?? '-',
      order.packageWeight ?? '-',
    ]);
    const csvContent = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-primary mb-1">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : "156"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {isLoading ? "..." : "12"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {isLoading ? "..." : "28"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {isLoading ? "..." : "116"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by order ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search
            </Button>
          </form>
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(value) => setDateFilter(typeof value === 'string' ? value : '')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExportCSV}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th>Length</th>
                <th>Breadth</th>
                <th>Height</th>
                <th>Weight</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                    </td>
                    <td>
                      <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                    </td>
                  </tr>
                ))
              ) : normalizedOrders.length > 0 ? (
                normalizedOrders.map((order: Order) => (
                  <tr key={order.id}>
                    <td>{order.id ? `#${order.id}` : ''}</td>
                    <td>{order.userId}</td>
                    <td>{formatDate(String(order.createdAt))}</td>
                    <td>{order.paymentMethod === 'cod' ? 'COD' : 'Prepaid'}</td>
                    <td>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>₹{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00'}</td>
                    <td>{order.packageLength ?? '-'}</td>
                    <td>{order.packageBreadth ?? '-'}</td>
                    <td>{order.packageHeight ?? '-'}</td>
                    <td>{order.packageWeight ?? '-'}</td>
                    <td>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          Update
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-6 text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) setPage(page - 1);
              }}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(i + 1);
                }}
                isActive={page === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) setPage(page + 1);
              }}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && formatDate(String(selectedOrder.createdAt))}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading text-sm text-muted-foreground mb-2">Customer Information</h3>
                  <div className="border rounded-md p-4">
                    <p className="font-medium">User ID: {selectedOrder.userId}</p>
                    <p>Email: Customer Email</p>
                    <p>Phone: Customer Phone</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-sm text-muted-foreground mb-2">Payment Information</h3>
                  <div className="border rounded-md p-4">
                    <p className="font-medium">Payment Method: {selectedOrder.paymentMethod}</p>
                    <p>Payment Status: Paid</p>
                    <p>Transaction ID: TXNID123456</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-sm text-muted-foreground mb-2">Shipping Address</h3>
                  <div className="border rounded-md p-4">
                    <p>{selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-sm text-muted-foreground mb-2">Billing Address</h3>
                  <div className="border rounded-md p-4">
                    <p>{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-sm text-muted-foreground mb-2">Order Items</h3>
                <div className="border rounded-md p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Product</span>
                      <span className="font-medium">Total</span>
                    </div>

                    <div className="space-y-2">
                      {/* Sample order items */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 bg-muted rounded"></div>
                          <div>
                            <p>Kumkumadi Face Oil</p>
                            <p className="text-xs text-muted-foreground">Qty: 1 × ₹1,995.00</p>
                          </div>
                        </div>
                        <span>₹1,995.00</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 bg-muted rounded"></div>
                          <div>
                            <p>Rose Jasmine Face Cleanser</p>
                            <p className="text-xs text-muted-foreground">Qty: 1 × ₹1,250.00</p>
                          </div>
                        </div>
                        <span>₹1,250.00</span>
                      </div>
                    </div>

                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹3,245.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>₹0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹584.10</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{typeof selectedOrder.totalAmount === 'number' ? selectedOrder.totalAmount.toFixed(2) : '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                {statusToUpdate === 'shipped' && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <Input
                      type="number"
                      placeholder="Length"
                      value={packageLength}
                      onChange={(e) => setPackageLength(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Breadth"
                      value={packageBreadth}
                      onChange={(e) => setPackageBreadth(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Height"
                      value={packageHeight}
                      onChange={(e) => setPackageHeight(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Weight"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(e.target.value)}
                    />
                  </div>
                )}
                <Select value={statusToUpdate || selectedOrder?.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-x-2">
                  <Button variant="outline">Print Invoice</Button>
                  <Button className="bg-primary hover:bg-primary-light text-white" onClick={handleUpdateOrder} disabled={updateOrderMutation.isPending}>
                    {updateOrderMutation.isPending ? "Updating..." : "Update Order"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
