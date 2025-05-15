import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  summary: string;
  content: string;
  imageUrl?: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isError, isLoading } = useQuery<Blog, Error>({
    queryKey: ['/api/blogs', slug],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/blogs/${slug}`);
      if (!res.ok) throw new Error('Blog not found');
      return res.json() as Promise<Blog>;
    },
    enabled: !!slug,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !blog) return <div>Blog not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{new Date(blog.publishedAt).toLocaleDateString()} by {blog.author}</p>
      {blog.imageUrl && <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto mb-6 object-cover" />}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
}
