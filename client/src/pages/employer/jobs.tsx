import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Plus, 
  MapPin, 
  Briefcase, 
  Users,
  Eye,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import type { Job } from "@shared/schema";

export default function EmployerJobs() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/employer/jobs"],
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/jobs/${id}/status`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employer/jobs"] });
    },
  });

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="employer">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="page-title">Manage Jobs</h1>
            <p className="text-muted-foreground">View and manage your full-time job postings</p>
          </div>
          <Button onClick={() => navigate("/employer/post-job")} data-testid="button-post-job">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
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
              <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4">Start by posting your first full-time job</p>
              <Button onClick={() => navigate("/employer/post-job")} data-testid="button-post-first-job">
                <Plus className="mr-2 h-4 w-4" />
                Post a Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} data-testid={`card-job-${job.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge variant={job.isActive ? "default" : "secondary"}>
                          {job.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{job.company}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.openings} opening{job.openings !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skills.split(",").slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline">{skill.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/employer/job-applications?jobId=${job.id}`)}
                        data-testid={`button-view-applications-${job.id}`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Applications
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus.mutate({ id: job.id, isActive: !job.isActive })}
                        data-testid={`button-toggle-${job.id}`}
                      >
                        {job.isActive ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
