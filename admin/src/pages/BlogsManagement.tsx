import React, { useState, useEffect, FormEvent } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Table, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Blog } from '@/types/index';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function BlogsManagement() {
  const { data: blogs = [], isLoading, refetch } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/blogs');
      return res.json();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/blogs/${id}`);
    },
    onSuccess: () => { refetch(); toast({ title: 'Deleted blog' }); },
    onError: () => { toast({ title: 'Deletion failed', variant: 'destructive' }); },
  });
  const { toast } = useToast();
  // Form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  // Reset form
  const resetForm = () => { setTitle(''); setSlug(''); setAuthor(''); setPublishedAt(''); setSummary(''); setContent(''); setImageUrl(''); setEditBlog(null); };
  // Prefill for edit
  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.title);
      setSlug(editBlog.slug);
      setAuthor(editBlog.author);
      setPublishedAt(editBlog.publishedAt.slice(0, 10));
      setSummary(editBlog.summary);
      setContent(editBlog.content);
      setImageUrl(editBlog.imageUrl || '');
    }
  }, [editBlog]);
  // Create and update mutations
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Blog>) => await apiRequest('POST', '/api/blogs', data),
    onSuccess: () => { toast({ title: 'Created blog' }); refetch(); setIsCreateOpen(false); resetForm(); },
    onError: () => toast({ title: 'Creation failed', variant: 'destructive' }),
  });
  const updateMutation = useMutation({
    mutationFn: async (data: Blog) => await apiRequest('PUT', `/api/blogs/${data._id}`, data),
    onSuccess: () => { toast({ title: 'Updated blog' }); refetch(); setIsEditOpen(false); resetForm(); },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>New Post</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {blogs.map(b => (
            <TableRow key={b._id}>
              <TableCell>{b.title}</TableCell>
              <TableCell>{b.author}</TableCell>
              <TableCell>{new Date(b.publishedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => { setEditBlog(b); setIsEditOpen(true); }} className="mr-2">Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(b._id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Blog Post</DialogTitle>
            <DialogDescription>Fill out the fields to create a blog post.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); createMutation.mutate({ title, slug, author, summary, content, imageUrl, publishedAt }); }} className="grid grid-cols-2 gap-4">
            <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} required /></div>
            <div><Label>Author</Label><Input value={author} onChange={e => setAuthor(e.target.value)} required /></div>
            <div><Label>Publish Date</Label><Input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} required /></div>
            <div className="col-span-2"><Label>Summary</Label><Textarea value={summary} onChange={e => setSummary(e.target.value)} required /></div>
            <div className="col-span-2"><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} required /></div>
            <div className="col-span-2"><Label>Image URL</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} /></div>
            <div className="col-span-2 flex justify-end"><Button type="submit">Create</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Update the fields below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); if (editBlog) updateMutation.mutate({ ...editBlog, title, slug, author, summary, content, imageUrl, publishedAt }); }} className="grid grid-cols-2 gap-4">
            <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} required /></div>
            <div><Label>Author</Label><Input value={author} onChange={e => setAuthor(e.target.value)} required /></div>
            <div><Label>Publish Date</Label><Input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} required /></div>
            <div className="col-span-2"><Label>Summary</Label><Textarea value={summary} onChange={e => setSummary(e.target.value)} required /></div>
            <div className="col-span-2"><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} required /></div>
            <div className="col-span-2"><Label>Image URL</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} /></div>
            <div className="col-span-2 flex justify-end"><Button type="submit">Update</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
