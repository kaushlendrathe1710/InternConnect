import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Search, 
  MapPin, 
  Briefcase, 
  IndianRupee,
  Building,
  Clock
} from "lucide-react";
import type { Job } from "@shared/schema";

export default function StudentJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const applyMutation = useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: number; coverLetter: string }) => {
      const res = await apiRequest("POST", `/api/jobs/${jobId}/apply`, { coverLetter });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the employer.",
      });
      setSelectedJob(null);
      setCoverLetter("");
      queryClient.invalidateQueries({ queryKey: ["/api/student/job-applications"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skills.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="page-title">Browse Jobs</h1>
          <p className="text-muted-foreground">Find full-time job opportunities matching your skills</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company, or skills..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} data-testid={`card-job-${job.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                      <p className="text-primary font-medium mb-3 flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {job.salary}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.split(",").slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="secondary">{skill.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button onClick={() => setSelectedJob(job)} data-testid={`button-apply-${job.id}`}>
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              at {selectedJob?.company} - {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Job Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {selectedJob?.description}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Cover Letter (Optional)</h4>
              <Textarea
                placeholder="Tell the employer why you're a great fit for this role..."
                className="min-h-[150px]"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                data-testid="input-cover-letter"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedJob && applyMutation.mutate({ jobId: selectedJob.id, coverLetter })}
              disabled={applyMutation.isPending}
              data-testid="button-submit-application"
            >
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
