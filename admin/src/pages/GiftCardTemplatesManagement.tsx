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

interface Template {
  _id: string;
  initialAmount: number;
  expiryDate: string;
  isActive: boolean;
  imageUrl?: string;
}

export default function GiftCardTemplatesManagement() {
  const queryClient = useQueryClient();
  const apiBase: string = import.meta.env.VITE_API_URL ?? '';

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchTemplates = async (): Promise<Template[]> => {
    const res = await fetch(`${apiBase}/api/admin/giftcard-templates`, { credentials: "include" });
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return [];
    }
    if (!res.ok) throw new Error("Failed to fetch templates");
    const payload = await res.json();
    if (Array.isArray(payload)) return payload;
    if (Array.isArray((payload as any).data)) return (payload as any).data;
    return [];
  };

  const { data: templates = [] } = useQuery<Template[], Error, Template[]>({
    queryKey: ["giftcard-templates"],
    queryFn: fetchTemplates,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/admin/giftcard-templates/${editing._id}`
        : "/api/admin/giftcard-templates";
      const method = editing ? "PUT" : "POST";
      const formData = new FormData();
      formData.append("initialAmount", initialAmount.toString());
      formData.append("expiryDate", expiryDate.toISOString());
      formData.append("isActive", isActive.toString());
      if (imageFile) formData.append("image", imageFile);
      return fetch(`${apiBase}${url}`, {
        method,
        credentials: "include",
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["giftcard-templates"] });
      setFormOpen(false);
      toast({ title: editing ? 'Updated template' : 'Created template', variant: 'default' });
    },
    onError: () => toast({ title: 'Error saving', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`${apiBase}/api/admin/giftcard-templates/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["giftcard-templates"] });
      toast({ title: 'Deleted template', variant: 'default' });
    },
    onError: () => toast({ title: 'Error deleting', variant: 'destructive' }),
  });

  function openForm(template?: Template) {
    if (template) {
      setEditing(template);
      setInitialAmount(template.initialAmount);
      setExpiryDate(new Date(template.expiryDate));
      setIsActive(template.isActive);
    } else {
      setEditing(null);
      setInitialAmount(0);
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
        <h1 className="text-2xl font-bold">Gift Card Templates</h1>
        <Button onClick={() => openForm()}>Add Template</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map(t => (
            <TableRow key={t._id}>
              <TableCell>
                {t.imageUrl && <img src={t.imageUrl} alt="" className="w-10 h-6 object-cover rounded" />}
              </TableCell>
              <TableCell>{t.initialAmount}</TableCell>
              <TableCell>{new Date(t.expiryDate).toLocaleDateString()}</TableCell>
              <TableCell>{t.isActive ? 'Active' : 'Inactive'}</TableCell>
              <TableCell className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => openForm(t)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(t._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Template' : 'Add Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Initial Amount</Label>
              <Input type="number" min={0} value={initialAmount} onChange={e => setInitialAmount(Number(e.target.value))} />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <DatePicker selected={expiryDate} onChange={date => setExpiryDate(date || new Date())} />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Active</Label>
              <Switch checked={isActive} onCheckedChange={checked => setIsActive(checked)} />
            </div>
            <div>
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
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
    </div>
  );
}
