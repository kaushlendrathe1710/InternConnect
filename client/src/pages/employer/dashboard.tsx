import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, authFetch } from "@/lib/auth-context";
import { 
  Users, 
  FileText, 
  Eye, 
  MoreHorizontal,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Internship = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  stipend: string;
  duration: string;
  description: string;
  skills: string;
  perks: string | null;
  isActive: boolean | null;
  approvalStatus: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  employerId: number;
};

export default function EmployerDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const { data: allInternships = [], isLoading } = useQuery<Internship[]>({
    queryKey: ["/api/internships/employer", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await authFetch(`/api/internships/employer/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch internships");
      return res.json();
    },
    enabled: !!user?.id,
  });

  const pendingInternships = allInternships.filter(i => i.approvalStatus === "pending");
  const approvedInternships = allInternships.filter(i => i.approvalStatus === "approved");
  const rejectedInternships = allInternships.filter(i => i.approvalStatus === "rejected");

  const getDisplayedInternships = () => {
    switch (activeTab) {
      case "pending":
        return pendingInternships;
      case "approved":
        return approvedInternships;
      case "rejected":
        return rejectedInternships;
      default:
        return allInternships;
    }
  };

  const displayedInternships = getDisplayedInternships();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (internship: Internship) => {
    if (internship.approvalStatus === "pending") {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Pending Review
        </Badge>
      );
    }
    if (internship.approvalStatus === "rejected") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      );
    }
    if (internship.isActive) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" /> Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
        Closed
      </Badge>
    );
  };

  return (
    <DashboardLayout role="employer">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="text-dashboard-title">Employer Dashboard</h1>
            <p className="text-muted-foreground">Manage your internships and track applicants.</p>
          </div>
          <Button 
            className="gap-2 shadow-sm"
            onClick={() => navigate("/employer/post")}
            data-testid="button-post-internship"
          >
            <PlusCircle className="w-4 h-4" /> Post Internship
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("all")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Postings</p>
                <h3 className="text-2xl font-bold" data-testid="text-total-postings">{allInternships.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("pending")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <h3 className="text-2xl font-bold" data-testid="text-pending-count">{pendingInternships.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("approved")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <h3 className="text-2xl font-bold" data-testid="text-approved-count">{approvedInternships.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("rejected")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-full text-red-600">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <h3 className="text-2xl font-bold" data-testid="text-rejected-count">{rejectedInternships.length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({allInternships.length})
              </TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">
                Pending ({pendingInternships.length})
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">
                Approved ({approvedInternships.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">
                Rejected ({rejectedInternships.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "pending" && pendingInternships.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Awaiting Admin Approval</p>
                <p className="text-sm text-yellow-700">
                  Your internship postings are being reviewed by our admin team. Once approved, they will be visible to students.
                </p>
              </div>
            </div>
          )}
           
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading your postings...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                      <tr>
                        <th className="px-6 py-4">Job Title</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Posted</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {displayedInternships.map((internship) => (
                        <tr key={internship.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-posting-${internship.id}`}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{internship.title}</div>
                            <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                              {internship.location} • {internship.stipend}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(internship)}
                            {internship.rejectionReason && (
                              <div className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={internship.rejectionReason}>
                                Reason: {internship.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {internship.type}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {formatDate(internship.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {internship.approvalStatus === "approved" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:text-primary/80 hover:bg-blue-50 mr-2"
                                onClick={() => navigate(`/employer/applications?internship=${internship.id}`)}
                                data-testid={`button-view-applicants-${internship.id}`}
                              >
                                View Applicants
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${internship.id}`}>
                                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/employer/edit/${internship.id}`)}>
                                  Edit Posting
                                </DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                {internship.isActive && (
                                  <DropdownMenuItem className="text-red-600">
                                    Close Posting
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {displayedInternships.length === 0 && (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">
                      {activeTab === "all" ? "No postings yet" : `No ${activeTab} internships`}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === "all" 
                        ? "Create your first internship posting to start receiving applications"
                        : `You don't have any ${activeTab} internship postings`
                      }
                    </p>
                    {activeTab === "all" && (
                      <Button onClick={() => navigate("/employer/post")}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Post Internship
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
