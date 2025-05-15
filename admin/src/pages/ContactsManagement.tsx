import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Table, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Contact } from '@/types/index';

export default function ContactsManagement() {
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/contacts');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Contact Submissions</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>Comments</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHeader>
        <tbody>
          {contacts.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.country}</TableCell>
              <TableCell>{c.mobile}</TableCell>
              <TableCell>{c.comments}</TableCell>
              <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
