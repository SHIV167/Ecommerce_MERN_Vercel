import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/apiUtils';
import { 
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, CheckCircle, XCircle } from 'lucide-react';

interface Review {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  productName?: string;
  userName?: string;
}

const ReviewManagement = () => {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch reviews based on filter
  const { data: reviews, isLoading, error } = useQuery({
    enabled: isAuthenticated,
    queryKey: ['reviews', filter],
    queryFn: async () => {
      const url = filter === 'all' 
        ? '/api/admin/reviews' 
        : `/api/admin/reviews?status=${filter}`;
      
      const response = await apiRequest(url, { method: 'GET' });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch reviews');
      }
      
      return response.json();
    }
  });

  // Update review status mutation
  const updateReviewStatus = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: 'approved' | 'rejected' }) => {
      const response = await apiRequest(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${status} review`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });

  // Handle approve/reject actions
  const handleApprove = (reviewId: string) => {
    updateReviewStatus.mutate(
      { reviewId, status: 'approved' },
      {
        onSuccess: () => toast.success('Review approved successfully'),
        onError: (error) => toast.error(error.message)
      }
    );
  };

  const handleReject = (reviewId: string) => {
    updateReviewStatus.mutate(
      { reviewId, status: 'rejected' },
      {
        onSuccess: () => toast.success('Review rejected'),
        onError: (error) => toast.error(error.message)
      }
    );
  };

  // Filter reviews by search term
  const filteredReviews = reviews?.filter((review: Review) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      review.comment.toLowerCase().includes(searchLower) ||
      (review.productName && review.productName.toLowerCase().includes(searchLower)) ||
      (review.userName && review.userName.toLowerCase().includes(searchLower))
    );
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <span key={index} className={index < rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ));
  };

  if (error) {
    return (
        <div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading reviews: {(error as Error).message}
          </div>
        </div>
    );
  }

  return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Review Management</h1>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <Select 
              value={filter} 
              onValueChange={(value) => setFilter(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending Reviews</SelectItem>
                  <SelectItem value="approved">Approved Reviews</SelectItem>
                  <SelectItem value="rejected">Rejected Reviews</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3 relative">
            <Input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="w-[40%]">Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No reviews found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReviews?.map((review: Review) => (
                      <TableRow key={review._id}>
                        <TableCell>{formatDate(review.createdAt)}</TableCell>
                        <TableCell>{review.productName || review.productId}</TableCell>
                        <TableCell className="font-semibold text-lg">
                          {renderStars(review.rating)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="line-clamp-3">{review.comment}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            review.status === 'approved' ? 'secondary' :
                            review.status === 'rejected' ? 'destructive' : 'default'
                          }>
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {review.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleApprove(review._id)}
                                disabled={updateReviewStatus.isPending}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleReject(review._id)}
                                disabled={updateReviewStatus.isPending}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {review.status === 'rejected' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleApprove(review._id)}
                              disabled={updateReviewStatus.isPending}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {review.status === 'approved' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReject(review._id)}
                              disabled={updateReviewStatus.isPending}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
  );
};

export default ReviewManagement;
