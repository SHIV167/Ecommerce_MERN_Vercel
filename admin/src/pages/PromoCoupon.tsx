import React, { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Info, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { apiRequest } from "../lib/queryClient";

interface CouponFormValues {
  code: string;
  description: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  minimumCartValue: number;
  maxUses: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface Coupon extends CouponFormValues {
  _id: string;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to determine coupon status badge
const getCouponStatusBadge = (coupon: Coupon) => {
  const isExpired = new Date() > new Date(coupon.endDate);
  const isNotStarted = new Date() < new Date(coupon.startDate);
  const isActive = coupon.isActive && !isExpired && !isNotStarted;
  
  let badgeVariant = isActive ? "default" : "secondary";
  let badgeClassName = "";
  let statusText = "";
  
  if (isExpired) {
    badgeClassName = "bg-destructive/20 text-destructive";
    statusText = "Expired";
  } else if (isNotStarted) {
    badgeClassName = "bg-yellow-500/20 text-yellow-500";
    statusText = "Scheduled";
  } else if (coupon.isActive) {
    statusText = "Active";
  } else {
    badgeClassName = "bg-gray-500/20 text-gray-500";
    statusText = "Inactive";
  }
  
  return {
    variant: badgeVariant as "default" | "secondary",
    className: badgeClassName,
    text: statusText
  };
};

export default function PromoCoupon() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");

  const form = useForm<CouponFormValues>({
    defaultValues: {
      code: "",
      description: "",
      discountAmount: 10,
      discountType: "percentage",
      minimumCartValue: 0,
      maxUses: -1,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
    },
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (editingCoupon) {
      form.reset({
        code: editingCoupon.code,
        description: editingCoupon.description,
        discountAmount: editingCoupon.discountAmount,
        discountType: editingCoupon.discountType,
        minimumCartValue: editingCoupon.minimumCartValue,
        maxUses: editingCoupon.maxUses,
        startDate: new Date(editingCoupon.startDate),
        endDate: new Date(editingCoupon.endDate),
        isActive: editingCoupon.isActive,
      });
      setActiveTab("create");
    }
  }, [editingCoupon, form]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      console.log('Fetching coupons...');
      const response = await apiRequest('GET', '/api/admin/coupons');
      const data = await response.json();
      console.log('Coupon API response:', data);
      
      // Ensure we're setting an array to the coupons state
      if (Array.isArray(data)) {
        setCoupons(data);
      } else if (data && typeof data === 'object') {
        // If response is an object that has a coupons property or similar
        if (Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        } else if (Array.isArray(data.data)) {
          setCoupons(data.data);
        } else {
          // If we can't find an array, set empty array and log error
          console.error("API response doesn't contain expected coupon data:", data);
          setCoupons([]);
        }
      } else {
        // Default to empty array
        console.error("Unexpected API response format:", data);
        setCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
      // Set empty array in case of error
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<CouponFormValues> = async (data) => {
    try {
      if (editingCoupon) {
        // Update existing coupon
        await apiRequest('PUT', `/api/admin/coupons/${editingCoupon._id}`, data);
        toast.success("Coupon updated successfully");
      } else {
        // Create new coupon
        await apiRequest('POST', '/api/admin/coupons', data);
        toast.success("Coupon created successfully");
      }
      
      form.reset();
      setEditingCoupon(null);
      setActiveTab("list");
      fetchCoupons();
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message ?? "Failed to save coupon");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/admin/coupons/${couponToDelete}`);
      toast.success("Coupon deleted successfully");
      fetchCoupons();
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  const confirmDelete = (id: string) => {
    setCouponToDelete(id);
    setDeleteDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingCoupon(null);
    form.reset();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PromoCode/Coupon Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="list" className="flex-1">
            View Coupons
          </TabsTrigger>
          <TabsTrigger value="create" className="flex-1">
            {editingCoupon ? "Edit Coupon" : "Create Coupon"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Coupons</CardTitle>
              <CardDescription>
                Manage your promotional coupons and discount codes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-semibold text-lg">No coupons found</h3>
                  <p className="text-muted-foreground">
                    Click the "Create Coupon" tab to add your first coupon.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Min. Cart</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((coupon) => {
                        const statusBadge = getCouponStatusBadge(coupon);
                        
                        return (
                          <TableRow key={coupon._id}>
                            <TableCell>
                              <Badge 
                                variant={statusBadge.variant}
                                className={statusBadge.className}
                              >
                                {statusBadge.text}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                            <TableCell>
                              {coupon.discountAmount}{coupon.discountType === 'percentage' ? '%' : ' $'}
                              <span className="text-xs text-muted-foreground block">
                                {coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                              </span>
                            </TableCell>
                            <TableCell>${coupon.minimumCartValue.toFixed(2)}</TableCell>
                            <TableCell>
                              {coupon.usedCount}/{coupon.maxUses === -1 ? '∞' : coupon.maxUses}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>From: {new Date(coupon.startDate).toLocaleDateString()}</div>
                                <div>To: {new Date(coupon.endDate).toLocaleDateString()}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEdit(coupon)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => confirmDelete(coupon._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</CardTitle>
              <CardDescription>
                {editingCoupon 
                  ? `Updating coupon code: ${editingCoupon.code}` 
                  : "Fill in the details to create a new promotional coupon."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="code"
                      rules={{
                        required: "Coupon code is required",
                        pattern: {
                          value: /^[A-Z0-9_-]{3,15}$/,
                          message: "Code must be 3-15 uppercase letters, numbers, underscores or hyphens"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code*</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="SUMMER25" 
                              className="uppercase"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormDescription>
                            Code customers will enter at checkout (uppercase only).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      rules={{ required: "Description is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description*</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Summer sale discount" />
                          </FormControl>
                          <FormDescription>
                            Brief description of this promotion.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountType"
                      rules={{ required: "Discount type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Percentage discounts apply a % off the total. Fixed discounts apply a specific dollar amount.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountAmount"
                      rules={{ 
                        required: "Discount amount is required",
                        min: {
                          value: 0.01,
                          message: "Amount must be greater than 0"
                        },
                        validate: (value, formValues) => 
                          !(formValues.discountType === "percentage" && value > 100) ||
                          "Percentage cannot exceed 100%"
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Amount*</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step={form.watch("discountType") === "percentage" ? "1" : "0.01"}
                              min={0}
                              max={form.watch("discountType") === "percentage" ? 100 : undefined}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch("discountType") === "percentage"
                              ? "Percentage discount (1-100%)"
                              : "Fixed amount in dollars"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minimumCartValue"
                      rules={{ 
                        min: {
                          value: 0,
                          message: "Minimum cart value cannot be negative"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Cart Value</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum order total required to use this coupon (0 for no minimum).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxUses"
                      rules={{ 
                        validate: (value) => 
                          value >= -1 || "Usage limit cannot be less than -1"
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usage Limit</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="1"
                              min="-1"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of times this coupon can be used. Set to -1 for unlimited.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      rules={{ required: "Start date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date*</FormLabel>
                          <FormControl>
                            <DatePicker
                              selected={field.value}
                              onChange={(date: Date | null) => field.onChange(date || new Date())}
                              dateFormat="MMMM d, yyyy"
                              className="w-full"
                              wrapperClassName="w-full"
                              customInput={<Input />}
                            />
                          </FormControl>
                          <FormDescription>
                            When this coupon becomes valid.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      rules={{ 
                        required: "End date is required",
                        validate: (value, formValues) => 
                          !formValues.startDate || value > formValues.startDate ||
                          "End date must be after start date"
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date*</FormLabel>
                          <FormControl>
                            <DatePicker
                              selected={field.value}
                              onChange={(date: Date | null) => field.onChange(date || new Date())}
                              dateFormat="MMMM d, yyyy"
                              className="w-full"
                              wrapperClassName="w-full"
                              customInput={<Input />}
                              minDate={form.watch("startDate") || new Date()}
                            />
                          </FormControl>
                          <FormDescription>
                            When this coupon expires.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Coupon Status</FormLabel>
                            <FormDescription>
                              Enable or disable this coupon.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    {editingCoupon && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel Edit
                      </Button>
                    )}
                    <Button type="submit">
                      {editingCoupon ? "Update Coupon" : "Create Coupon"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this coupon? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 