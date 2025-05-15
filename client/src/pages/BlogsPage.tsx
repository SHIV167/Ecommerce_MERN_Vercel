import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  summary: string;
  imageUrl?: string;
}

export default function BlogsPage() {
  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/blogs');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <Link
            href={`/blogs/${blog.slug}`}
            key={blog._id}
            className="block border rounded-lg overflow-hidden hover:shadow-lg"
          >
            {blog.imageUrl && (
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{blog.title}</h2>
              <p className="text-sm text-gray-500">{new Date(blog.publishedAt).toLocaleDateString()}</p>
              <p className="mt-2 text-gray-700">{blog.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
