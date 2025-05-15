import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from 'react-helmet';
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient"; // Assuming apiRequest is defined in this file
import { useToast } from "@/hooks/use-toast"; // Assuming useToast is defined in this file

export default function AccountPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout, updateProfile } = useAuth();
  console.log('AccountPage user context:', user);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Redirect to login after auth state resolves
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/account");
    }
  }, [authLoading, isAuthenticated, navigate]);
  
  // --- Normalize user ID for query (MongoDB id only, since _id is not in User type) ---
  const normalizedUserId = user?.id;
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders?userId=${normalizedUserId}`],
    queryFn: async () => {
      if (!normalizedUserId) return [];
      const res = await apiRequest('GET', `/api/orders?userId=${normalizedUserId}`);
      return res.json();
    },
    enabled: !!normalizedUserId,
    refetchInterval: 10000, // auto-refresh orders every 10 seconds
  });
  
  const [editingAddress, setEditingAddress] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  useEffect(() => {
    if (user) setFormData({
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      phone: user.phone || "",
    });
  }, [user]);
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setEditingAddress(false);
  };
  
  // --- Edit Profile State ---
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  // --- Change Password State ---
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  // --- Profile Edit Handler ---
  const handleProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setEditingProfile(false);
      toast({ title: 'Profile updated!' });
    } catch (err) {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };
  // --- Password Change Handler ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (!user) {
      toast({ title: 'User not loaded', variant: 'destructive' });
      return;
    }
    try {
      await apiRequest('POST', `/api/users/${user.id}/password`, passwordForm);
      setChangingPassword(false);
      toast({ title: 'Password updated!' });
    } catch (err) {
      toast({ title: 'Failed to update password', variant: 'destructive' });
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout successful",
        description: "You have been logged out."
      });
    } catch {
      toast({
        title: "Logout failed",
        description: "Could not log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Show nothing while auth is loading or redirecting (after all hooks)
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>My Account | Kama Ayurveda</title>
        <meta name="description" content="Manage your account and view your orders." />
      </Helmet>
      
      <div className="bg-neutral-cream py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl text-primary text-center mb-2">My Account</h1>
          {user?.name && (
            <p className="text-center text-neutral-gray mb-0">Welcome back, {user.name}!</p>
          )}
        </div>
      </div>
      
      <div className="container max-w-5xl mx-auto px-4 py-12 -mt-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full bg-white shadow-sm rounded-lg justify-center mb-8 p-1 gap-2">
            <TabsTrigger 
              value="profile" 
              className="font-heading text-sm text-primary data-[state=active]:bg-primary data-[state=active]:text-white rounded-md flex-1 max-w-[200px] py-3"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="font-heading text-sm text-primary data-[state=active]:bg-primary data-[state=active]:text-white rounded-md flex-1 max-w-[200px] py-3"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="addresses" 
              className="font-heading text-sm text-primary data-[state=active]:bg-primary data-[state=active]:text-white rounded-md flex-1 max-w-[200px] py-3"
            >
              Addresses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="bg-primary/5 p-6 border-b border-neutral-sand">
                    <h2 className="font-heading text-xl text-primary">Profile Information</h2>
                    <p className="text-sm text-neutral-gray mt-1">Manage your personal information</p>
                  </div>
                  <div className="p-8">
                    {editingProfile ? (
                      <form onSubmit={handleProfileEdit} className="space-y-4">
                        <input
                          placeholder="Name"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                        <input
                          placeholder="Email"
                          type="email"
                          value={profileForm.email}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                        <input
                          placeholder="Phone"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit">Save</Button>
                          <Button variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-neutral-50 rounded-lg p-6">
                          <label className="block text-sm font-medium text-neutral-gray mb-2">Name</label>
                          <p className="font-medium text-lg">{user?.name || "Not provided"}</p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-6">
                          <label className="block text-sm font-medium text-neutral-gray mb-2">Email</label>
                          <p className="font-medium text-lg">{user?.email}</p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-6">
                          <label className="block text-sm font-medium text-neutral-gray mb-2">Phone</label>
                          <p className="font-medium text-lg">{user?.phone || "Not provided"}</p>
                        </div>
                      </div>
                    )}
                    {!editingProfile && (
                      <div className="mt-6">
                        <Button 
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={() => setEditingProfile(true)}
                        >
                          Edit Profile
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="bg-primary/5 p-6 border-b border-neutral-sand">
                    <h2 className="font-heading text-xl text-primary">Change Password</h2>
                    <p className="text-sm text-neutral-gray mt-1">Update your account password</p>
                  </div>
                  <div className="p-6">
                    {changingPassword ? (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <input
                          placeholder="Current Password"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                        <input
                          placeholder="New Password"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                        <input
                          placeholder="Confirm New Password"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit">Update Password</Button>
                          <Button variant="ghost" onClick={() => setChangingPassword(false)}>Cancel</Button>
                        </div>
                      </form>
                    ) : (
                      <Button 
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                        onClick={() => setChangingPassword(true)}
                      >
                        Change Password
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden sticky top-8">
                  <div className="bg-primary/5 p-6 border-b border-neutral-sand">
                    <h2 className="font-heading text-xl text-primary">Account Actions</h2>
                    <p className="text-sm text-neutral-gray mt-1">Manage your account settings</p>
                  </div>
                  <div className="p-6">
                    <Button 
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white mb-4"
                    >
                      Logout
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full text-neutral-gray hover:text-red-500"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-0">
            <div className="border border-neutral-sand rounded-md overflow-hidden">
              <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                <h2 className="font-heading text-lg text-primary">Your Orders</h2>
              </div>
              <div className="p-6">
                {ordersLoading ? (
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border border-neutral-sand rounded-md p-4">
                        <div className="h-6 w-32 bg-neutral-sand mb-4"></div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="h-4 w-full bg-neutral-sand"></div>
                          <div className="h-4 w-full bg-neutral-sand"></div>
                          <div className="h-4 w-full bg-neutral-sand"></div>
                          <div className="h-4 w-full bg-neutral-sand"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="divide-y divide-neutral-sand">
                    {orders.map((order) => (
                      <div key={order.id} className="py-4">
                        <div className="flex flex-col md:flex-row justify-between mb-2">
                          <div>
                            <p className="font-heading text-primary">Order #{order.id}</p>
                            <p className="text-sm text-neutral-gray">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-neutral-100 text-neutral-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="mb-4">
                          <span className="font-medium">Total:</span> ₹{order.totalAmount.toFixed(2)}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-gray"
                            onClick={() => navigate(`/orders/${order.id}/track`)}
                          >
                            Track Order
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            <a href={`/api/orders/${order.id}/invoice`}>Download Invoice</a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-gray mb-4">You haven't placed any orders yet.</p>
                    <Button 
                      asChild
                      className="bg-primary hover:bg-primary-light text-white"
                    >
                      <a href="/collections/all">Start Shopping</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="addresses" className="mt-0">
            <div className="border border-neutral-sand rounded-md overflow-hidden">
              <div className="bg-neutral-cream p-4 border-b border-neutral-sand">
                <h2 className="font-heading text-lg text-primary">Saved Addresses</h2>
              </div>
              <div className="p-6">
                {editingAddress ? (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <input
                      placeholder="Address"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                    <input
                      placeholder="City"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                    <input
                      placeholder="State"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                    <input
                      placeholder="Zip Code"
                      value={formData.zipCode}
                      onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                    <input
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Save Address</Button>
                      <Button variant="ghost" onClick={() => setEditingAddress(false)}>Cancel</Button>
                    </div>
                  </form>
                ) : user?.address ? (
                  <div className="border border-neutral-sand rounded-md p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">Default Address</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-primary" onClick={() => setEditingAddress(true)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-red-500">Delete</Button>
                      </div>
                    </div>
                    <p>{user.name}</p>
                    <p>{user.address}</p>
                    <p>{user.city}, {user.state} {user.zipCode}</p>
                    <p>{user.phone}</p>
                  </div>
                ) : (
                  <p className="text-neutral-gray mb-4">You don't have any saved addresses yet.</p>
                )}
                {!editingAddress && (
                  <Button className="bg-primary hover:bg-primary-light text-white" onClick={() => setEditingAddress(true)}>
                    Add New Address
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
