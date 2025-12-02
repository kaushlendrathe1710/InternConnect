import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Download,
  MessageSquare,
  Eye
} from "lucide-react";

type ApplicationStatus = "all" | "new" | "shortlisted" | "interviewed" | "hired" | "rejected";

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  graduationYear: string;
  skills: string[];
  appliedFor: string;
  postingId: number;
  appliedOn: string;
  status: ApplicationStatus;
  resumeScore: number;
  experience: string;
  location: string;
}

export default function EmployerApplications() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("all");
  const [postingFilter, setPostingFilter] = useState("all");

  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 9876543210",
      college: "IIT Delhi",
      degree: "B.Tech Computer Science",
      graduationYear: "2025",
      skills: ["React", "Node.js", "Python", "MongoDB"],
      appliedFor: "Full Stack Developer Intern",
      postingId: 1,
      appliedOn: "Nov 30, 2024",
      status: "new",
      resumeScore: 92,
      experience: "2 internships",
      location: "Delhi"
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya@example.com",
      phone: "+91 9876543211",
      college: "BITS Pilani",
      degree: "B.Tech Electronics",
      graduationYear: "2024",
      skills: ["JavaScript", "React", "CSS", "Git"],
      appliedFor: "Full Stack Developer Intern",
      postingId: 1,
      appliedOn: "Nov 29, 2024",
      status: "shortlisted",
      resumeScore: 88,
      experience: "1 internship",
      location: "Mumbai"
    },
    {
      id: 3,
      name: "Amit Kumar",
      email: "amit@example.com",
      phone: "+91 9876543212",
      college: "NIT Trichy",
      degree: "B.Tech IT",
      graduationYear: "2025",
      skills: ["Digital Marketing", "SEO", "Social Media", "Analytics"],
      appliedFor: "Social Media Marketing Intern",
      postingId: 2,
      appliedOn: "Nov 28, 2024",
      status: "interviewed",
      resumeScore: 85,
      experience: "Fresher",
      location: "Chennai"
    },
    {
      id: 4,
      name: "Sneha Reddy",
      email: "sneha@example.com",
      phone: "+91 9876543213",
      college: "IIIT Hyderabad",
      degree: "B.Tech CSE",
      graduationYear: "2024",
      skills: ["Python", "Java", "SQL", "AWS"],
      appliedFor: "Full Stack Developer Intern",
      postingId: 1,
      appliedOn: "Nov 27, 2024",
      status: "hired",
      resumeScore: 95,
      experience: "3 internships",
      location: "Hyderabad"
    },
    {
      id: 5,
      name: "Vikram Singh",
      email: "vikram@example.com",
      phone: "+91 9876543214",
      college: "DTU Delhi",
      degree: "B.Tech Mechanical",
      graduationYear: "2025",
      skills: ["Content Writing", "Copywriting", "Social Media"],
      appliedFor: "Social Media Marketing Intern",
      postingId: 2,
      appliedOn: "Nov 26, 2024",
      status: "rejected",
      resumeScore: 65,
      experience: "Fresher",
      location: "Delhi"
    }
  ]);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const postingId = params.get("posting");
    if (postingId) {
      setPostingFilter(postingId);
    }
  }, [searchString]);

  const postings = [
    { id: 1, title: "Full Stack Developer Intern" },
    { id: 2, title: "Social Media Marketing Intern" },
    { id: 3, title: "Business Development Associate" }
  ];

  const updateApplicantStatus = (applicantId: number, newStatus: ApplicationStatus) => {
    setApplicants(prev => prev.map(app => {
      if (app.id === applicantId) {
        return { ...app, status: newStatus };
      }
      return app;
    }));

    const applicant = applicants.find(a => a.id === applicantId);
    const statusLabels: Record<ApplicationStatus, string> = {
      all: "All",
      new: "New",
      shortlisted: "Shortlisted",
      interviewed: "Interviewed",
      hired: "Hired",
      rejected: "Rejected"
    };

    toast({
      title: `Status updated`,
      description: `${applicant?.name} has been marked as ${statusLabels[newStatus]}`,
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const styles: Record<ApplicationStatus, string> = {
      all: "",
      new: "bg-blue-50 text-blue-700 border-blue-200",
      shortlisted: "bg-yellow-50 text-yellow-700 border-yellow-200",
      interviewed: "bg-purple-50 text-purple-700 border-purple-200",
      hired: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200"
    };

    const labels: Record<ApplicationStatus, string> = {
      all: "All",
      new: "New",
      shortlisted: "Shortlisted",
      interviewed: "Interviewed",
      hired: "Hired",
      rejected: "Rejected"
    };

    return (
      <Badge variant="outline" className={`font-normal ${styles[status]}`}>
        {labels[status]}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.college.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesPosting = postingFilter === "all" || app.postingId.toString() === postingFilter;
    return matchesSearch && matchesStatus && matchesPosting;
  });

  const statusCounts = {
    all: applicants.filter(a => postingFilter === "all" || a.postingId.toString() === postingFilter).length,
    new: applicants.filter(a => a.status === "new" && (postingFilter === "all" || a.postingId.toString() === postingFilter)).length,
    shortlisted: applicants.filter(a => a.status === "shortlisted" && (postingFilter === "all" || a.postingId.toString() === postingFilter)).length,
    interviewed: applicants.filter(a => a.status === "interviewed" && (postingFilter === "all" || a.postingId.toString() === postingFilter)).length,
    hired: applicants.filter(a => a.status === "hired" && (postingFilter === "all" || a.postingId.toString() === postingFilter)).length,
    rejected: applicants.filter(a => a.status === "rejected" && (postingFilter === "all" || a.postingId.toString() === postingFilter)).length,
  };

  return (
    <DashboardLayout role="employer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Applications</h1>
          <p className="text-muted-foreground">Review and manage all applicants for your internship postings</p>
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicationStatus)} className="w-full">
          <TabsList className="bg-white border flex-wrap h-auto p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm" data-testid="tab-all">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="new" className="text-xs sm:text-sm" data-testid="tab-new">
              New ({statusCounts.new})
            </TabsTrigger>
            <TabsTrigger value="shortlisted" className="text-xs sm:text-sm" data-testid="tab-shortlisted">
              Shortlisted ({statusCounts.shortlisted})
            </TabsTrigger>
            <TabsTrigger value="interviewed" className="text-xs sm:text-sm" data-testid="tab-interviewed">
              Interviewed ({statusCounts.interviewed})
            </TabsTrigger>
            <TabsTrigger value="hired" className="text-xs sm:text-sm" data-testid="tab-hired">
              Hired ({statusCounts.hired})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs sm:text-sm" data-testid="tab-rejected">
              Rejected ({statusCounts.rejected})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by name, email, or college..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={postingFilter} onValueChange={setPostingFilter}>
            <SelectTrigger className="w-full sm:w-64" data-testid="select-posting">
              <SelectValue placeholder="Filter by posting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Postings</SelectItem>
              {postings.map(posting => (
                <SelectItem key={posting.id} value={posting.id.toString()}>
                  {posting.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredApplicants.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No applicants found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search or filters" : "You'll see applicants here once students start applying"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplicants.map((applicant) => (
              <Card key={applicant.id} className="hover:shadow-md transition-shadow" data-testid={`card-applicant-${applicant.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {applicant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900" data-testid={`text-name-${applicant.id}`}>
                            {applicant.name}
                          </h3>
                          {getStatusBadge(applicant.status)}
                          <span className={`text-sm font-medium ${getScoreColor(applicant.resumeScore)}`}>
                            <Star className="w-3 h-3 inline mr-1" />
                            {applicant.resumeScore}% match
                          </span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Applied for: <span className="font-medium text-slate-700">{applicant.appliedFor}</span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> {applicant.college}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {applicant.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Applied {applicant.appliedOn}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {applicant.skills.slice(0, 4).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                              {skill}
                            </Badge>
                          ))}
                          {applicant.skills.length > 4 && (
                            <Badge variant="secondary" className="text-xs font-normal">
                              +{applicant.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/employer/messages?applicant=${applicant.id}`)}
                          data-testid={`button-message-${applicant.id}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" /> Message
                        </Button>
                        <Button 
                          size="sm"
                          data-testid={`button-view-profile-${applicant.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View Profile
                        </Button>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" data-testid={`button-actions-${applicant.id}`}>
                            Actions <MoreHorizontal className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateApplicantStatus(applicant.id, "shortlisted")}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Shortlist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateApplicantStatus(applicant.id, "interviewed")}>
                            <Clock className="w-4 h-4 mr-2 text-purple-600" /> Mark as Interviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateApplicantStatus(applicant.id, "hired")}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" /> Hire
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" /> Download Resume
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => updateApplicantStatus(applicant.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredApplicants.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredApplicants.length} of {applicants.length} applicants
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
