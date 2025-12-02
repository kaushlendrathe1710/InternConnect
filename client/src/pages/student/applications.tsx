import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  Clock, 
  Building2, 
  IndianRupee,
  Calendar,
  ExternalLink,
  Eye,
  ChevronRight,
  Filter,
  Briefcase
} from "lucide-react";

type ApplicationStatus = "all" | "applied" | "viewed" | "shortlisted" | "rejected" | "hired";

interface Application {
  id: number;
  role: string;
  company: string;
  companyLogo?: string;
  location: string;
  stipend: string;
  duration: string;
  status: ApplicationStatus;
  appliedOn: string;
  lastActivity: string;
  viewedByEmployer: boolean;
  type: "internship" | "job";
}

export default function StudentApplications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("all");
  const [activeTab, setActiveTab] = useState("all");

  const applications: Application[] = [
    {
      id: 1,
      role: "Full Stack Developer Intern",
      company: "TechNova Solutions",
      location: "Bangalore (Remote)",
      stipend: "₹25,000/month",
      duration: "3 months",
      status: "shortlisted",
      appliedOn: "Nov 28, 2024",
      lastActivity: "Employer viewed your application",
      viewedByEmployer: true,
      type: "internship"
    },
    {
      id: 2,
      role: "UI/UX Design Intern",
      company: "CreativePulse",
      location: "Mumbai",
      stipend: "₹15,000/month",
      duration: "6 months",
      status: "applied",
      appliedOn: "Nov 25, 2024",
      lastActivity: "Application submitted",
      viewedByEmployer: false,
      type: "internship"
    },
    {
      id: 3,
      role: "Product Management Intern",
      company: "GrowthX",
      location: "Delhi NCR",
      stipend: "₹20,000/month",
      duration: "2 months",
      status: "rejected",
      appliedOn: "Nov 15, 2024",
      lastActivity: "Application not selected",
      viewedByEmployer: true,
      type: "internship"
    },
    {
      id: 4,
      role: "Data Science Intern",
      company: "Analytics Pro",
      location: "Hyderabad (Hybrid)",
      stipend: "₹30,000/month",
      duration: "4 months",
      status: "viewed",
      appliedOn: "Nov 20, 2024",
      lastActivity: "Employer viewed your profile",
      viewedByEmployer: true,
      type: "internship"
    },
    {
      id: 5,
      role: "Marketing Executive",
      company: "BrandBoost Inc",
      location: "Remote",
      stipend: "₹4-6 LPA",
      duration: "Full-time",
      status: "hired",
      appliedOn: "Oct 30, 2024",
      lastActivity: "Offer accepted",
      viewedByEmployer: true,
      type: "job"
    }
  ];

  const getStatusBadge = (status: ApplicationStatus) => {
    const styles: Record<ApplicationStatus, string> = {
      all: "",
      applied: "bg-blue-50 text-blue-700 border-blue-200",
      viewed: "bg-yellow-50 text-yellow-700 border-yellow-200",
      shortlisted: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      hired: "bg-purple-50 text-purple-700 border-purple-200"
    };

    const labels: Record<ApplicationStatus, string> = {
      all: "All",
      applied: "Applied",
      viewed: "Under Review",
      shortlisted: "Shortlisted",
      rejected: "Not Selected",
      hired: "Hired"
    };

    return (
      <Badge variant="outline" className={`font-normal ${styles[status]}`}>
        {labels[status]}
      </Badge>
    );
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesTab = activeTab === "all" || 
                      (activeTab === "internships" && app.type === "internship") ||
                      (activeTab === "jobs" && app.type === "job");
    return matchesSearch && matchesStatus && matchesTab;
  });

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === "applied").length,
    viewed: applications.filter(a => a.status === "viewed").length,
    shortlisted: applications.filter(a => a.status === "shortlisted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
    hired: applications.filter(a => a.status === "hired").length,
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">My Applications</h1>
          <p className="text-muted-foreground">Track and manage all your internship and job applications</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border">
            <TabsTrigger value="all" data-testid="tab-all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="internships" data-testid="tab-internships">
              Internships ({applications.filter(a => a.type === "internship").length})
            </TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              Jobs ({applications.filter(a => a.type === "job").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by role or company..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicationStatus)}>
            <SelectTrigger className="w-full sm:w-48" data-testid="button-filter-status">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
              <SelectItem value="applied">Applied ({statusCounts.applied})</SelectItem>
              <SelectItem value="viewed">Under Review ({statusCounts.viewed})</SelectItem>
              <SelectItem value="shortlisted">Shortlisted ({statusCounts.shortlisted})</SelectItem>
              <SelectItem value="rejected">Not Selected ({statusCounts.rejected})</SelectItem>
              <SelectItem value="hired">Hired ({statusCounts.hired})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Applied", count: applications.length, color: "bg-blue-50 text-blue-700" },
            { label: "Under Review", count: statusCounts.viewed + statusCounts.applied, color: "bg-yellow-50 text-yellow-700" },
            { label: "Shortlisted", count: statusCounts.shortlisted, color: "bg-green-50 text-green-700" },
            { label: "Hired", count: statusCounts.hired, color: "bg-purple-50 text-purple-700" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold" data-testid={`text-stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                  {stat.count}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No applications found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search or filters" : "Start applying to internships to see them here"}
                </p>
                <Button data-testid="button-find-internships">Find Internships</Button>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow" data-testid={`card-application-${application.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
                        {application.company.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900" data-testid={`text-role-${application.id}`}>
                            {application.role}
                          </h3>
                          {getStatusBadge(application.status)}
                          {application.viewedByEmployer && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Viewed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> {application.company}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {application.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" /> {application.stipend}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {application.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Applied on {application.appliedOn}
                      </p>
                      <p className="text-xs text-slate-600">{application.lastActivity}</p>
                      <Button variant="outline" size="sm" className="mt-2" data-testid={`button-view-${application.id}`}>
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
