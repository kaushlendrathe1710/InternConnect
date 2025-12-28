import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  ExternalLink
} from "lucide-react";
import type { Assignment } from "@shared/schema";
import { format } from "date-fns";

export default function StudentAssignments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/student/assignments"],
  });

  const submitMutation = useMutation({
    mutationFn: async ({ id, submissionText, submissionUrl }: { id: number; submissionText: string; submissionUrl?: string }) => {
      const res = await apiRequest("POST", `/api/assignments/${id}/submit`, { submissionText, submissionUrl });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Assignment submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/student/assignments"] });
      setSelectedAssignment(null);
      setSubmissionText("");
      setSubmissionUrl("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "Submitted":
        return <Badge variant="secondary"><Send className="h-3 w-3 mr-1" />Submitted</Badge>;
      case "Reviewed":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = (deadline: Date | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="page-title">My Assignments</h1>
          <p className="text-muted-foreground">View and submit assignments from employers</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground">Assignments from employers will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} data-testid={`card-assignment-${assignment.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {assignment.description}
                      </p>
                      {assignment.deadline && (
                        <p className={`text-sm ${isOverdue(assignment.deadline) && assignment.status === "Pending" ? "text-red-500" : "text-muted-foreground"}`}>
                          <Clock className="inline h-3 w-3 mr-1" />
                          Deadline: {format(new Date(assignment.deadline), "PPP")}
                          {isOverdue(assignment.deadline) && assignment.status === "Pending" && " (Overdue)"}
                        </p>
                      )}
                      {assignment.feedback && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Employer Feedback:</p>
                          <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.status === "Pending" && (
                        <Button
                          onClick={() => setSelectedAssignment(assignment)}
                          data-testid={`button-submit-${assignment.id}`}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Submit
                        </Button>
                      )}
                      {assignment.status !== "Pending" && (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedAssignment(assignment)}
                          data-testid={`button-view-${assignment.id}`}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.deadline && (
                <>Deadline: {format(new Date(selectedAssignment.deadline), "PPP")}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Assignment Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {selectedAssignment?.description}
              </p>
            </div>

            {selectedAssignment?.status === "Pending" && (
              <>
                <div className="space-y-2">
                  <Label>Your Submission</Label>
                  <Textarea
                    placeholder="Write your answer or describe your work..."
                    className="min-h-[150px]"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    data-testid="input-submission"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link to Work (Optional)</Label>
                  <Input
                    placeholder="https://github.com/... or https://drive.google.com/..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    data-testid="input-submission-url"
                  />
                </div>
              </>
            )}

            {selectedAssignment?.status !== "Pending" && selectedAssignment?.submissionText && (
              <div>
                <h4 className="font-medium mb-2">Your Submission</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-line">{selectedAssignment.submissionText}</p>
                  {selectedAssignment.submissionUrl && (
                    <a 
                      href={selectedAssignment.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline mt-2 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View attached link
                    </a>
                  )}
                </div>
              </div>
            )}

            {selectedAssignment?.feedback && (
              <div>
                <h4 className="font-medium mb-2">Employer Feedback</h4>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm">{selectedAssignment.feedback}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {selectedAssignment?.status === "Pending" ? (
              <>
                <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedAssignment && submitMutation.mutate({
                    id: selectedAssignment.id,
                    submissionText,
                    submissionUrl: submissionUrl || undefined,
                  })}
                  disabled={!submissionText.trim() || submitMutation.isPending}
                  data-testid="button-confirm-submit"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
