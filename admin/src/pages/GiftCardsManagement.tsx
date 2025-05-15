import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "@/hooks/use-toast";

interface GiftCard {
  _id: string;
  code: string;
  initialAmount: number;
  balance: number;
  expiryDate: string;
  isActive: boolean;
  imageUrl?: string;
}

export default function GiftCardsManagement() {
  const queryClient = useQueryClient();
  // require API URL from env
  const apiBase: string = import.meta.env.VITE_API_URL ?? (
    window.location.origin.includes('-admin')
      ? window.location.origin.replace('-admin', '-server')
      : window.location.origin
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GiftCard | null>(null);
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch gift cards with auth-check and data-sanity
  const fetchGiftCards = async (): Promise<GiftCard[]> => {
    const res = await fetch(`${apiBase}/api/admin/giftcards`, { credentials: 'include' });
    if (res.status === 401) {
      // Not authenticated: redirect to login
      window.location.href = '/admin/login';
      return [];
    }
    if (!res.ok) throw new Error('Failed to fetch gift cards');
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any).data)) return (data as any).data;
    return [];
  };

  const { data: cards = [], isLoading, isError, error } = useQuery<GiftCard[], Error, GiftCard[]>({
    queryKey: ['giftcards'],
    queryFn: fetchGiftCards,
  });
  // Commented out early returns to preserve hook order and fix React error #310
  // if (isLoading) return <div className="p-6">Loading gift cards...</div>;
  // if (isError) return <div className="p-6 text-red-500">Error fetching gift cards: {error?.message}</div>;

  const saveMutation = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/admin/giftcards/${editing._id}`
        : '/api/admin/giftcards';
      const method = editing ? 'PUT' : 'POST';
      const formData = new FormData();
      formData.append('initialAmount', initialAmount.toString());
      if (editing) formData.append('balance', balance.toString());
      formData.append('expiryDate', expiryDate.toISOString());
      formData.append('isActive', isActive.toString());
      if (imageFile) formData.append('image', imageFile);
      return fetch(`${apiBase}${url}`, {
        method,
        credentials: 'include',
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftcards'] });
      setFormOpen(false);
      toast({ title: editing ? 'Updated gift card' : 'Created gift card', variant: 'default' });
    },
    onError: () => toast({ title: 'Error saving', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`${apiBase}/api/admin/giftcards/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error('Failed');
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftcards'] });
      toast({ title: 'Deleted gift card', variant: 'default' });
    },
    onError: () => toast({ title: 'Error deleting', variant: 'destructive' }),
  });

  function openForm(card?: GiftCard) {
    if (card) {
      setEditing(card);
      setInitialAmount(card.initialAmount);
      setBalance(card.balance);
      setExpiryDate(new Date(card.expiryDate));
      setIsActive(card.isActive);
    } else {
      setEditing(null);
      setInitialAmount(0);
      setBalance(0);
      setExpiryDate(new Date());
      setIsActive(true);
    }
    setImageFile(null);
    setFormOpen(true);
  }

  function handleSubmit() {
    saveMutation.mutate();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gift Cards</h1>
        <Button onClick={() => openForm()}>Add Gift Card</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Initial</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((c: any) => {
            const id = c._id;
            return (
              <TableRow key={id}>
                <TableCell>
                  {c.imageUrl && <img src={c.imageUrl} alt="" className="w-10 h-6 object-cover rounded" />}
                </TableCell>
                <TableCell>{c.code}</TableCell>
                <TableCell>{c.initialAmount}</TableCell>
                <TableCell>{c.balance}</TableCell>
                <TableCell>{new Date(c.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell>{c.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openForm(c)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Gift Card' : 'Add Gift Card'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Initial Amount</Label>
              <Input type="number" min={0} value={initialAmount} onChange={e => setInitialAmount(Number(e.target.value))} />
            </div>
            {editing && (
              <div>
                <Label>Balance</Label>
                <Input type="number" min={0} value={balance} onChange={e => setBalance(Number(e.target.value))} />
              </div>
            )}
            <div>
              <Label>Expiry Date</Label>
              <DatePicker
                selected={expiryDate}
                onChange={(date: Date | null) => { if (date) setExpiryDate(date); }}
                className="w-full"
              />
            </div>
            <div>
              <Label>Image</Label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isLoading && <div className="p-6">Loading gift cards...</div>}
      {isError && <div className="p-6 text-red-500">Error fetching gift cards: {error?.message}</div>}
    </div>
  );
}
