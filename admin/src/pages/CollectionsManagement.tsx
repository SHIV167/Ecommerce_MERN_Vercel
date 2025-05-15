import React, { useState, useEffect } from "react";
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
import { Product } from "@shared/schema";

// Collection type (sync with backend)
type Collection = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  featured?: boolean;
};

type CollectionFormProps = {
  open: boolean;
  onClose: () => void;
  onSave: (col: Partial<Collection>) => void;
  initial?: Partial<Collection>;
  products: Product[];
  selectedProductIds: string[];
  onSelectionChange: (ids: string[]) => void;
};

function CollectionForm({ open, onClose, onSave, initial, products, selectedProductIds, onSelectionChange }: CollectionFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [desktopImageUrl, setDesktopImageUrl] = useState(initial?.desktopImageUrl || "");
  const [mobileImageUrl, setMobileImageUrl] = useState(initial?.mobileImageUrl || "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [filter, setFilter] = useState("");
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(filter.toLowerCase()));

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
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Collection" : "Add Collection"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex space-x-6">
          <div className="flex-1 space-y-4">
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
              <Label>Desktop Banner URL</Label>
              <Input value={desktopImageUrl} onChange={e => setDesktopImageUrl(e.target.value)} />
            </div>
            <div>
              <Label>Mobile Banner URL</Label>
              <Input value={mobileImageUrl} onChange={e => setMobileImageUrl(e.target.value)} />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              <Label>Featured</Label>
            </div>
          </div>
          <div className="w-1/3 space-y-4 flex flex-col">
            <div>
              <Label>Products</Label>
              <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search products" />
              <ul>
                {filteredProducts.map(product => (
                  <li key={product._id}>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product._id!)}
                      onChange={() => {
                        if (selectedProductIds.includes(product._id!)) {
                          onSelectionChange(selectedProductIds.filter(id => id !== product._id!));
                        } else {
                          onSelectionChange([...selectedProductIds, product._id!]);
                        }
                      }}
                    />
                    <span>{product.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CollectionsManagement() {
  const queryClient = useQueryClient();
  const { data: collectionsData = [], isLoading } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
    queryFn: () => apiRequest('GET', '/api/collections').then(res => res.json()),
  });
  const createCol = useMutation<Response, unknown, Partial<Collection>>({
    mutationFn: (data: Partial<Collection>) => apiRequest('POST', '/api/collections', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/collections'] }),
  });
  const updateCol = useMutation<Response, unknown, Partial<Collection>>({
    mutationFn: (data: Partial<Collection>) => apiRequest('PUT', `/api/collections/${data.id!}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/collections'] }),
  });
  const deleteCol = useMutation<Response, unknown, string>({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/collections/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/collections'] }),
  });

  // fetch all products for mapping
  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/products');
      const json = await res.json() as { products: Product[] };
      return json.products;
    },
  });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [initialProductIds, setInitialProductIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editCol, setEditCol] = useState<Collection | undefined>();

  // load mapped products when editing
  useEffect(() => {
    if (editCol?.slug) {
      apiRequest('GET', `/api/collections/${editCol.slug}/products`)
        .then(res => res.json())
        .then((mapped: Product[]) => {
          const ids = mapped.map(p => p._id!);
          setSelectedProductIds(ids);
          setInitialProductIds(ids);
        });
    }
  }, [editCol]);

  function handleSave(col: Partial<Collection>): void {
    if (col.id) {
      updateCol.mutate(col, {
        onSuccess: async () => {
          // sync mapping
          const toAdd = selectedProductIds.filter(id => !initialProductIds.includes(id));
          const toRemove = initialProductIds.filter(id => !selectedProductIds.includes(id));
          await Promise.all(toAdd.map(pid => apiRequest('POST', `/api/collections/${col.slug}/products`, { productId: pid })));
          await Promise.all(toRemove.map(pid => apiRequest('DELETE', `/api/collections/${col.slug}/products/${pid}`)));
          setInitialProductIds(selectedProductIds);
          queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
        }
      });
    } else {
      createCol.mutate(col, {
        onSuccess: async res => {
          const newCol: Collection = await res.json();
          // map products after create
          await Promise.all(selectedProductIds.map(pid => apiRequest('POST', `/api/collections/${newCol.slug}/products`, { productId: pid })));
          queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
        }
      });
    }
    setFormOpen(false);
  }

  return (
    <div className="space-y-6 max-w-screen-lg mx-auto px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading text-primary mb-1">Collection Management</h1>
        <Button onClick={() => { setEditCol(undefined); setFormOpen(true); }}>Add Collection</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
          <CardDescription>Manage your product collections</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <div>Loading...</div> : (
            <table className="min-w-full text-sm">
              <thead><tr><th>Name</th><th>Slug</th><th>Featured</th><th>Actions</th></tr></thead>
              <tbody>
                {collectionsData?.map(col => (
                  <tr key={col.id} className="border-b">
                    <td>{col.name}</td>
                    <td>{col.slug}</td>
                    <td>{col.featured ? 'Yes' : 'No'}</td>
                    <td>
                      <Button size="sm" variant="outline" onClick={() => { setEditCol(col); setFormOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => deleteCol.mutate(col.id!)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <CollectionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editCol}
        products={allProducts}
        selectedProductIds={selectedProductIds}
        onSelectionChange={setSelectedProductIds}
      />
    </div>
  );
}
