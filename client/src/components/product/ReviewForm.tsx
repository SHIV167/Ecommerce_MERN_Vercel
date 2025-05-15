import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onClose: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { productId: string; rating: number; comment: string }) => {
      const response = await apiRequest(
        "POST", 
        `/api/products/${reviewData.productId}/reviews`, 
        reviewData
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch product reviews
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      toast.success("Thank you! Your review has been submitted successfully.");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit review. Please try again.");
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      toast.error("Please write a detailed review with at least 5 characters.");
      return;
    }
    
    setIsSubmitting(true);
    reviewMutation.mutate({
      productId,
      rating,
      comment: comment.trim()
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-sand shadow-md relative">
      <button 
        onClick={onClose} 
        className="absolute right-4 top-4 text-neutral-gray hover:text-primary"
        aria-label="Close review form"
      >
        <X size={20} />
      </button>
      
      <h3 className="font-heading text-xl text-primary mb-4">Write Your Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="rating" className="block text-sm font-medium text-neutral-gray mb-1">
            Your Rating*
          </Label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
                aria-label={`Rate ${star} stars`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 ${
                    star <= rating ? "text-yellow-400" : "text-neutral-sand"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="comment" className="block text-sm font-medium text-neutral-gray mb-1">
            Your Review*
          </Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={5}
            required
            className="w-full border border-neutral-sand rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="mr-2 border-neutral-sand text-neutral-gray hover:bg-neutral-cream"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-light text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
