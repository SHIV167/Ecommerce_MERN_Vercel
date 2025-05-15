import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

// Category type
type Category = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  featured?: boolean;
};

type CategoryFormProps = {
  open: boolean;
  onClose: () => void;
  onSave: (cat: Partial<Category>) => void;
  initial?: Partial<Category>;
};

function CategoryForm({ open, onClose, onSave, initial }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [desktopImageUrl, setDesktopImageUrl] = useState(initial?.desktopImageUrl || "");
  const [mobileImageUrl, setMobileImageUrl] = useState(initial?.mobileImageUrl || "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  React.useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setSlug(initial?.slug || "");
      setDescription(initial?.description || "");
      setImageUrl(initial?.imageUrl || "");
      setDesktopImageUrl(initial?.desktopImageUrl || "");
      setMobileImageUrl(initial?.mobileImageUrl || "");
      setFeatured(initial?.featured ?? false);
    }
  }, [open, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug) {
      toast({ title: "Name and slug are required.", variant: "destructive" });
      return;
    }
    onSave({ name, slug, description, imageUrl, desktopImageUrl, mobileImageUrl, featured, id: initial?.id });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>
          <div>
            <Label>Desktop Image URL</Label>
            <Input value={desktopImageUrl} onChange={e => setDesktopImageUrl(e.target.value)} />
          </div>
          <div>
            <Label>Mobile Image URL</Label>
            <Input value={mobileImageUrl} onChange={e => setMobileImageUrl(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={featured} onCheckedChange={setFeatured} />
            <Label>Featured</Label>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesManagement() {
  const queryClient = useQueryClient();
  const { data: categoriesData = [], isLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => apiRequest('GET', '/api/categories').then(res => res.json()),
  });
  const createCat = useMutation({
    mutationFn: (data: Partial<Category>) => apiRequest('POST', '/api/categories', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/categories'] }),
  });
  const updateCat = useMutation({
    mutationFn: (data: Partial<Category>) => apiRequest('PUT', `/api/categories/${data.id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/categories'] }),
  });
  const deleteCat = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/categories'] }),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | undefined>();

  function handleSave(cat: Partial<Category>) {
    if (cat.id) updateCat.mutate(cat);
    else createCat.mutate(cat);
    setFormOpen(false);
  }

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading text-primary mb-1">Category Management</h1>
        <Button onClick={() => { setEditCat(undefined); setFormOpen(true); }}>Add Category</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage your product categories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <div>Loading...</div> : (
            <table className="min-w-full text-sm">
              <thead><tr><th>Name</th><th>Slug</th><th>Featured</th><th>Actions</th></tr></thead>
              <tbody>
                {categories?.map(cat => (
                  <tr key={cat.id} className="border-b">
                    <td>{cat.name}</td>
                    <td>{cat.slug}</td>
                    <td>{cat.featured ? 'Yes' : 'No'}</td>
                    <td>
                      <Button size="sm" variant="outline" onClick={() => { setEditCat(cat); setFormOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => deleteCat.mutate(cat.id!)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <CategoryForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initial={editCat} />
    </div>
  );
}
