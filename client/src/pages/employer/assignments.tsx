import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Eye,
  Send
} from "lucide-react";
import type { Assignment } from "@shared/schema";
import { format } from "date-fns";

export default function EmployerAssignments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [feedback, setFeedback] = useState("");

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/employer/assignments"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: number; status: string; feedback?: string }) => {
      const res = await apiRequest("PATCH", `/api/assignments/${id}/review`, { status, feedback });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Assignment reviewed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/assignments"] });
      setSelectedAssignment(null);
      setFeedback("");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "Submitted":
        return <Badge variant="secondary"><Send className="h-3 w-3 mr-1" />Submitted</Badge>;
      case "Reviewed":
        return <Badge><CheckCircle className="h-3 w-3 mr-1" />Reviewed</Badge>;
      case "Rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="employer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="page-title">Assignments</h1>
          <p className="text-muted-foreground">Manage and review candidate assignments</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground">Send assignments to candidates from their application page</p>
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
                        <p className="text-sm text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Deadline: {format(new Date(assignment.deadline), "PPP")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.status === "Submitted" && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment)}
                          data-testid={`button-review-${assignment.id}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                      )}
                      {assignment.status !== "Submitted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment)}
                          data-testid={`button-view-${assignment.id}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
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
              Status: {selectedAssignment?.status}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Assignment Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {selectedAssignment?.description}
              </p>
            </div>
            {selectedAssignment?.submissionText && (
              <div>
                <h4 className="font-medium mb-2">Candidate Submission</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-line">{selectedAssignment.submissionText}</p>
                  {selectedAssignment.submissionUrl && (
                    <a 
                      href={selectedAssignment.submissionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline mt-2 block"
                    >
                      View attached link
                    </a>
                  )}
                </div>
              </div>
            )}
            {selectedAssignment?.status === "Submitted" && (
              <div>
                <h4 className="font-medium mb-2">Your Feedback</h4>
                <Textarea
                  placeholder="Provide feedback to the candidate..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  data-testid="input-feedback"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            {selectedAssignment?.status === "Submitted" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => reviewMutation.mutate({ 
                    id: selectedAssignment.id, 
                    status: "Rejected", 
                    feedback 
                  })}
                  data-testid="button-reject"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => reviewMutation.mutate({ 
                    id: selectedAssignment.id, 
                    status: "Reviewed", 
                    feedback 
                  })}
                  data-testid="button-approve"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            {selectedAssignment?.status !== "Submitted" && (
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
