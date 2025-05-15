import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Testimonial {
  _id: string;
  name: string;
  content: string;
  rating: number;
  featured: boolean;
  createdAt: string;
}

export default function TestimonialsManagement() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [featured, setFeatured] = useState(false);

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/testimonials");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const url = editing
        ? `/api/admin/testimonials/${editing._id}`
        : "/api/admin/testimonials";
      const method = editing ? "PUT" : "POST";
      const payload = { name, content, rating, featured };
      return apiRequest(method, url, payload).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setFormOpen(false);
      toast({ title: editing ? "Updated testimonial" : "Created testimonial" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast({ title: "Deleted testimonial" });
    },
    onError: () => toast({ title: "Error deleting", variant: "destructive" }),
  });

  function openForm(testimonial?: Testimonial) {
    if (testimonial) {
      setEditing(testimonial);
      setName(testimonial.name);
      setContent(testimonial.content);
      setRating(testimonial.rating);
      setFeatured(testimonial.featured);
    } else {
      setEditing(null);
      setName("");
      setContent("");
      setRating(5);
      setFeatured(false);
    }
    setFormOpen(true);
  }

  function handleSubmit() {
    saveMutation.mutate();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Button onClick={() => openForm()}>Add Testimonial</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testimonials.map(t => (
            <TableRow key={t._id}>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.content}</TableCell>
              <TableCell>{t.rating}</TableCell>
              <TableCell>{t.featured ? "Yes" : "No"}</TableCell>
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
            <DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} />
            </div>
            <div>
              <Label>Rating</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Featured</Label>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
