import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authFetch } from "@/lib/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal,
  FileText,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Loader2,
  Inbox
} from "lucide-react";

type ApplicationStatus = "all" | "Applied" | "Shortlisted" | "Interviewed" | "Hired" | "Rejected";

interface Application {
  id: number;
  studentId: number;
  internshipId: number;
  status: string;
  coverLetter: string | null;
  appliedAt: string | null;
}

interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  employerId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function EmployerApplications() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("all");
  const [internshipFilter, setInternshipFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const internshipId = params.get("internship");
    if (internshipId) {
      setInternshipFilter(internshipId);
    }
  }, [searchString]);

  const { data: internships = [], isLoading: loadingInternships } = useQuery<Internship[]>({
    queryKey: ["/api/internships/employer", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await authFetch(`/api/internships/employer/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch internships");
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: allApplications = [], isLoading: loadingApplications } = useQuery<{application: Application, student: User, internship: Internship}[]>({
    queryKey: ["/api/employer/applications", user?.id, internships],
    queryFn: async () => {
      if (!user?.id || internships.length === 0) return [];
      
      const allApps: {application: Application, student: User, internship: Internship}[] = [];
      
      for (const internship of internships) {
        try {
          const res = await authFetch(`/api/applications/internship/${internship.id}`);
          if (res.ok) {
            const applications: Application[] = await res.json();
            for (const app of applications) {
              const studentRes = await authFetch(`/api/users/${app.studentId}`);
              if (studentRes.ok) {
                const student = await studentRes.json();
                allApps.push({ application: app, student, internship });
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching applications for internship ${internship.id}:`, error);
        }
      }
      
      return allApps;
    },
    enabled: !!user?.id && internships.length > 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const res = await authFetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employer/applications"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Applied": "bg-blue-50 text-blue-700 border-blue-200",
      "Shortlisted": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Interviewed": "bg-purple-50 text-purple-700 border-purple-200",
      "Hired": "bg-green-50 text-green-700 border-green-200",
      "Rejected": "bg-red-50 text-red-700 border-red-200"
    };

    return (
      <Badge variant="outline" className={`font-normal ${styles[status] || ""}`}>
        {status}
      </Badge>
    );
  };

  const filteredApplications = allApplications.filter(({ application, student, internship }) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;
    const matchesInternship = internshipFilter === "all" || internship.id.toString() === internshipFilter;
    return matchesSearch && matchesStatus && matchesInternship;
  });

  const statusCounts = {
    all: allApplications.filter(a => internshipFilter === "all" || a.internship.id.toString() === internshipFilter).length,
    Applied: allApplications.filter(a => a.application.status === "Applied" && (internshipFilter === "all" || a.internship.id.toString() === internshipFilter)).length,
    Shortlisted: allApplications.filter(a => a.application.status === "Shortlisted" && (internshipFilter === "all" || a.internship.id.toString() === internshipFilter)).length,
    Interviewed: allApplications.filter(a => a.application.status === "Interviewed" && (internshipFilter === "all" || a.internship.id.toString() === internshipFilter)).length,
    Hired: allApplications.filter(a => a.application.status === "Hired" && (internshipFilter === "all" || a.internship.id.toString() === internshipFilter)).length,
    Rejected: allApplications.filter(a => a.application.status === "Rejected" && (internshipFilter === "all" || a.internship.id.toString() === internshipFilter)).length,
  };

  const isLoading = loadingInternships || loadingApplications;

  return (
    <DashboardLayout role="employer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Applications</h1>
          <p className="text-muted-foreground">Review and manage all applicants for your internship postings</p>
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicationStatus)}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="gap-1" data-testid="tab-all">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="Applied" className="gap-1" data-testid="tab-new">
              New ({statusCounts.Applied})
            </TabsTrigger>
            <TabsTrigger value="Shortlisted" className="gap-1" data-testid="tab-shortlisted">
              Shortlisted ({statusCounts.Shortlisted})
            </TabsTrigger>
            <TabsTrigger value="Interviewed" className="gap-1" data-testid="tab-interviewed">
              Interviewed ({statusCounts.Interviewed})
            </TabsTrigger>
            <TabsTrigger value="Hired" className="gap-1" data-testid="tab-hired">
              Hired ({statusCounts.Hired})
            </TabsTrigger>
            <TabsTrigger value="Rejected" className="gap-1" data-testid="tab-rejected">
              Rejected ({statusCounts.Rejected})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or college..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={internshipFilter} onValueChange={setInternshipFilter}>
            <SelectTrigger className="w-full sm:w-[250px]" data-testid="select-internship">
              <SelectValue placeholder="Filter by internship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Internships</SelectItem>
              {internships.map((internship) => (
                <SelectItem key={internship.id} value={internship.id.toString()}>
                  {internship.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground max-w-md">
                {internships.length === 0 
                  ? "You haven't posted any internships yet. Post an internship to start receiving applications."
                  : "No applications match your current filters. Try adjusting your search criteria."
                }
              </p>
              {internships.length === 0 && (
                <Button className="mt-4" onClick={() => navigate("/employer/post")}>
                  Post an Internship
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(({ application, student, internship }) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow" data-testid={`application-card-${application.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <Avatar className="h-14 w-14 bg-primary/10">
                      <AvatarFallback className="text-primary font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Applied for: <span className="font-medium text-slate-700">{internship.title}</span>
                          </p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${application.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ applicationId: application.id, status: "Shortlisted" })}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-yellow-600" /> Shortlist
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ applicationId: application.id, status: "Interviewed" })}>
                              <Clock className="h-4 w-4 mr-2 text-purple-600" /> Mark Interviewed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ applicationId: application.id, status: "Hired" })}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Hire
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ applicationId: application.id, status: "Rejected" })} className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {internship.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> 
                          Applied {application.appliedAt 
                            ? new Date(application.appliedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                            : "Recently"
                          }
                        </span>
                      </div>

                      {application.coverLetter && (
                        <div className="bg-slate-50 p-3 rounded-lg text-sm">
                          <p className="text-muted-foreground line-clamp-2">{application.coverLetter}</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/employer/messages?student=${student.id}`)}>
                          <MessageSquare className="h-4 w-4" /> Message
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" /> {student.email}
                        </Button>
                      </div>
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
