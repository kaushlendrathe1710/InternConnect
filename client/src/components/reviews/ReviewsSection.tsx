import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, ThumbsUp, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "@shared/schema";

interface ReviewsSectionProps {
  type: "internship" | "job" | "company";
  targetId: number;
  showWriteReview?: boolean;
}

export function ReviewsSection({ type, targetId, showWriteReview = true }: ReviewsSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const endpoint = type === "company" 
    ? `/api/company-profiles/${targetId}/reviews`
    : type === "job"
    ? `/api/jobs/${targetId}/reviews`
    : `/api/internships/${targetId}/reviews`;

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [endpoint],
  });

  const createReview = useMutation({
    mutationFn: async (data: {
      rating: number;
      title?: string;
      content?: string;
      wouldRecommend: boolean;
      isAnonymous: boolean;
    }) => {
      const payload = {
        ...data,
        ...(type === "internship" ? { internshipId: targetId } : {}),
        ...(type === "job" ? { jobId: targetId } : {}),
        ...(type === "company" ? { companyProfileId: targetId } : {}),
      };
      const res = await apiRequest("POST", "/api/reviews", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Review submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setContent("");
    setWouldRecommend(true);
    setIsAnonymous(false);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    createReview.mutate({
      rating,
      title: title || undefined,
      content: content || undefined,
      wouldRecommend,
      isAnonymous,
    });
  };

  const averageRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Reviews</CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
        {showWriteReview && user?.role === "student" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-write-review">
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience to help other students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1"
                        data-testid={`star-${star}`}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Review Title (Optional)</Label>
                  <Input
                    placeholder="Sum up your experience in a few words"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-review-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your Review (Optional)</Label>
                  <Textarea
                    placeholder="Share details about your experience..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="input-review-content"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommend"
                    checked={wouldRecommend}
                    onCheckedChange={(checked) => setWouldRecommend(checked as boolean)}
                    data-testid="checkbox-recommend"
                  />
                  <label htmlFor="recommend" className="text-sm">
                    I would recommend this to others
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                    data-testid="checkbox-anonymous"
                  />
                  <label htmlFor="anonymous" className="text-sm">
                    Post anonymously
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createReview.isPending}
                  data-testid="button-submit-review"
                >
                  {createReview.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No reviews yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0" data-testid={`review-${review.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {review.isAnonymous ? "Anonymous" : "Verified Student"}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {review.title && (
                  <p className="font-medium text-sm mb-1">{review.title}</p>
                )}
                {review.content && (
                  <p className="text-sm text-muted-foreground">{review.content}</p>
                )}
                {review.wouldRecommend && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <ThumbsUp className="h-3 w-3" />
                    Would recommend
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
