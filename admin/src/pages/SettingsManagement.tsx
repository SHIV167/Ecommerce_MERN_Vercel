import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch as UiSwitch } from '@/components/ui/switch';

export default function SettingsManagement() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/settings');
      return res.json();
    }
  });

  const [siteName, setSiteName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [shiprocketApiKey, setShiprocketApiKey] = useState('');
  const [shiprocketApiSecret, setShiprocketApiSecret] = useState('');
  const [shiprocketSourcePincode, setShiprocketSourcePincode] = useState('');
  const [shiprocketPickupLocation, setShiprocketPickupLocation] = useState('');
  const [shiprocketChannelId, setShiprocketChannelId] = useState<number>(0);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '');
      setSupportEmail(settings.supportEmail || '');
      setMaintenanceMode(!!settings.maintenanceMode);
      setRazorpayKeyId(settings.razorpayKeyId || '');
      setRazorpayKeySecret(settings.razorpayKeySecret || '');
      setShiprocketApiKey(settings.shiprocketApiKey || '');
      setShiprocketApiSecret(settings.shiprocketApiSecret || '');
      setShiprocketSourcePincode(settings.shiprocketSourcePincode || '');
      setShiprocketPickupLocation(settings.shiprocketPickupLocation || '');
      setShiprocketChannelId(settings.shiprocketChannelId || 0);
    }
  }, [settings]);

  const { mutate: updateSettings, status } = useMutation({
    mutationFn: async () => {
      const payload = { 
        siteName, 
        supportEmail, 
        maintenanceMode, 
        razorpayKeyId, 
        razorpayKeySecret, 
        shiprocketApiKey, 
        shiprocketApiSecret, 
        shiprocketSourcePincode, 
        shiprocketPickupLocation, 
        shiprocketChannelId 
      };
      const res = await apiRequest('PUT', '/api/admin/settings', payload);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Settings updated' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (err: any) => {
      toast({ title: 'Error updating settings', description: err.message, variant: 'destructive' });
    }
  });

  const isUpdating = status === 'pending';

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary mb-4">Settings</h1>
      <div className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="supportEmail">Support Email</Label>
          <Input
            id="supportEmail"
            type="email"
            value={supportEmail}
            onChange={e => setSupportEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
          <Input
            id="razorpayKeyId"
            value={razorpayKeyId}
            onChange={e => setRazorpayKeyId(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
          <Input
            id="razorpayKeySecret"
            type="password"
            value={razorpayKeySecret}
            onChange={e => setRazorpayKeySecret(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="shiprocketApiKey">Shiprocket API Key</Label>
          <Input
            id="shiprocketApiKey"
            value={shiprocketApiKey}
            onChange={e => setShiprocketApiKey(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="shiprocketApiSecret">Shiprocket API Secret</Label>
          <Input
            id="shiprocketApiSecret"
            type="password"
            value={shiprocketApiSecret}
            onChange={e => setShiprocketApiSecret(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="shiprocketSourcePincode">Shiprocket Source Pincode</Label>
          <Input
            id="shiprocketSourcePincode"
            value={shiprocketSourcePincode}
            onChange={e => setShiprocketSourcePincode(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="shiprocketPickupLocation">Shiprocket Pickup Location</Label>
          <Input
            id="shiprocketPickupLocation"
            value={shiprocketPickupLocation}
            onChange={e => setShiprocketPickupLocation(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="shiprocketChannelId">Shiprocket Channel ID</Label>
          <Input
            id="shiprocketChannelId"
            type="number"
            value={shiprocketChannelId}
            onChange={e => setShiprocketChannelId(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center space-x-2">
          <UiSwitch
            id="maintenanceMode"
            checked={maintenanceMode}
            onCheckedChange={() => setMaintenanceMode(!maintenanceMode)}
          />
          <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
        </div>
        <Button
          onClick={() => updateSettings()}
          disabled={isUpdating}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
