import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function UsersManagement() {
  const { toast } = useToast();
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users');
      return res.json();
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
      const res = await apiRequest('PUT', `/api/users/${id}`, { isAdmin });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'User updated' });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'User deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading text-primary">Users Management</h1>
      <p className="text-neutral-gray">List and manage your users here.</p>
      <table className="w-full mt-4 table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Admin</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id}>
              <td className="border px-2 py-1">{user.id}</td>
              <td className="border px-2 py-1">{user.name || "-"}</td>
              <td className="border px-2 py-1">{user.email}</td>
              <td className="border px-2 py-1">{user.isAdmin ? "Yes" : "No"}</td>
              <td className="border px-2 py-1 space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateUserMutation.status === 'pending'}
                  onClick={() =>
                    updateUserMutation.mutate({ id: user.id, isAdmin: !user.isAdmin })
                  }
                >
                  {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteUserMutation.status === 'pending'}
                  onClick={() => deleteUserMutation.mutate(user.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
