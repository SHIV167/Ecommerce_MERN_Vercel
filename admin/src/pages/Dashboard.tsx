import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Order, Product } from "../../../shared/schema";

interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  lowStockProducts: number;
}

export default function Dashboard() {
  // Fetch summary data
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/admin/dashboard/summary"]
  });
  
  // Fetch recent orders
  const { data: recentOrders = [], isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders?limit=5"],
  });
  
  // Fetch top products
  const { data: topProducts = [], isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/dashboard/top-products"],
  });
  
  // Sample data for charts when API doesn't return data yet
  const sampleSalesData = [
    { name: 'Jan', revenue: 7000 },
    { name: 'Feb', revenue: 5000 },
    { name: 'Mar', revenue: 12000 },
    { name: 'Apr', revenue: 10000 },
    { name: 'May', revenue: 18000 },
    { name: 'Jun', revenue: 15000 },
    { name: 'Jul', revenue: 22000 },
  ];
  
  const sampleProductCategoryData = [
    { name: 'Skincare', value: 45 },
    { name: 'Haircare', value: 28 },
    { name: 'Bath & Body', value: 17 },
    { name: 'Wellness', value: 10 },
  ];
  
  // Default summary data if API hasn't returned yet
  const summary: DashboardSummary = summaryData || {
    totalOrders: 125,
    totalRevenue: 145000,
    totalCustomers: 248,
    lowStockProducts: 5,
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading text-primary mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store's performance</p>
        </div>
        
        <Link href="/admin/products">
          <Button className="bg-primary hover:bg-primary/90 text-white">
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
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
            </svg>
            Manage Products
          </Button>
        </Link>
      </div>
      
      {/* Quick Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Complete these steps to set up your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-primary text-white p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold">Manage Products</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Add, edit, and organize your product catalog</p>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full">Go to Products</Button>
              </Link>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/10 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-muted text-primary p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
                <h3 className="font-semibold">Process Orders</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">View and manage customer orders</p>
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full">Go to Orders</Button>
              </Link>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/10 transition-colors">
              <div className="flex items-center mb-3">
                <div className="bg-muted text-primary p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="font-semibold">Manage Customers</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">View customer information and purchase history</p>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">Go to Customers</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Total Orders</CardTitle>
            <CardDescription>All time orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isSummaryLoading ? (
                <div className="h-9 w-20 animate-pulse bg-muted rounded"></div>
              ) : (
                summary.totalOrders
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-500">↑ 12%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Revenue</CardTitle>
            <CardDescription>All time sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isSummaryLoading ? (
                <div className="h-9 w-28 animate-pulse bg-muted rounded"></div>
              ) : (
                `₹${summary.totalRevenue.toLocaleString()}`
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-500">↑ 8%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Customers</CardTitle>
            <CardDescription>Total registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isSummaryLoading ? (
                <div className="h-9 w-20 animate-pulse bg-muted rounded"></div>
              ) : (
                summary.totalCustomers
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-500">↑ 5%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Low Stock</CardTitle>
            <CardDescription>Products that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isSummaryLoading ? (
                <div className="h-9 w-10 animate-pulse bg-muted rounded"></div>
              ) : (
                summary.lowStockProducts
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-red-500">↑ 2</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Store performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly">
              <TabsList className="mb-4">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sampleSalesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#5C3834"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Sales by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sampleProductCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="value" fill="#D4B78F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders from your store</CardDescription>
          </CardHeader>
          <CardContent>
            {isOrdersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-3 w-32 bg-muted rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-2">Order ID</th>
                    <th className="text-left pb-2">Customer</th>
                    <th className="text-left pb-2">Status</th>
                    <th className="text-right pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border">
                      <td className="py-3">#{order.id}</td>
                      <td className="py-3">{order.userId}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-right">₹{order.totalAmount?.toFixed(2) ?? '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-6 text-muted-foreground">No recent orders found</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products</CardDescription>
          </CardHeader>
          <CardContent>
            {isProductsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-border animate-pulse">
                    <div className="h-10 w-10 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded"></div>
                      <div className="h-3 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sample top products */}
                <div className="flex gap-3 py-2 border-b border-border">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1629198735566-e36c0bd9ad76"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Kumkumadi Face Oil</p>
                    <p className="text-sm text-muted-foreground">128 sold</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2 border-b border-border">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1631729371254-42c2892f0e6e"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Bringadi Hair Oil</p>
                    <p className="text-sm text-muted-foreground">95 sold</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2 border-b border-border">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1566958769312-82cef41d19ef"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Rose Jasmine Cleanser</p>
                    <p className="text-sm text-muted-foreground">87 sold</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2 border-b border-border">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1601055903647-ddf1ee9701b1"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Pure Rose Water</p>
                    <p className="text-sm text-muted-foreground">76 sold</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2">
                  <div className="h-10 w-10 bg-muted rounded-md overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1608571423539-e951a99b1e8a"
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Youth-Clarifying Mask</p>
                    <p className="text-sm text-muted-foreground">68 sold</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
