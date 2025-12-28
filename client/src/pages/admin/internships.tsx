import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth, authFetch } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Search,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

interface Internship {
  id: number;
  employerId: number;
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
}

export default function AdminInternships() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const response = await authFetch("/api/admin/internships");
        if (!response.ok) throw new Error("Failed to fetch internships");
        const data = await response.json();
        setInternships(data);
      } catch (error) {
        console.error("Error fetching internships:", error);
        toast({
          title: "Error",
          description: "Failed to load internships",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, []);

  const handleApprove = async (internshipId: number) => {
    setActionLoading(internshipId);
    try {
      const response = await authFetch(`/api/admin/internships/${internshipId}/approve`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve internship");
      }
      
      const updatedInternship = await response.json();
      setInternships(prev => prev.map(i => i.id === internshipId ? updatedInternship : i));
      
      toast({
        title: "Internship Approved",
        description: "The internship is now visible to students.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (internship: Internship) => {
    setSelectedInternship(internship);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedInternship) return;
    
    setActionLoading(selectedInternship.id);
    try {
      const response = await authFetch(`/api/admin/internships/${selectedInternship.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectionReason }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject internship");
      }
      
      const updatedInternship = await response.json();
      setInternships(prev => prev.map(i => i.id === selectedInternship.id ? updatedInternship : i));
      
      toast({
        title: "Internship Rejected",
        description: "The employer has been notified.",
      });
      
      setRejectDialogOpen(false);
      setSelectedInternship(null);
      setRejectionReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (internshipId: number, isActive: boolean) => {
    setActionLoading(internshipId);
    try {
      const response = await authFetch(`/api/admin/internships/${internshipId}/status`, {
        method: "POST",
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update internship");
      }
      
      const updatedInternship = await response.json();
      setInternships(prev => prev.map(i => i.id === internshipId ? updatedInternship : i));
      
      toast({
        title: isActive ? "Internship Activated" : "Internship Deactivated",
        description: `Internship has been ${isActive ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingInternships = internships.filter(i => i.approvalStatus === "pending");
  const approvedInternships = internships.filter(i => i.approvalStatus === "approved");
  const rejectedInternships = internships.filter(i => i.approvalStatus === "rejected");

  const getDisplayedInternships = () => {
    let filtered: Internship[];
    switch (activeTab) {
      case "pending":
        filtered = pendingInternships;
        break;
      case "approved":
        filtered = approvedInternships;
        break;
      case "rejected":
        filtered = rejectedInternships;
        break;
      default:
        filtered = internships;
    }
    
    return filtered.filter(internship => 
      internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredInternships = getDisplayedInternships();

  const getStatusBadge = (internship: Internship) => {
    if (internship.approvalStatus === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 gap-1">
          <Clock className="w-3 h-3" /> Pending Review
        </Badge>
      );
    }
    if (internship.approvalStatus === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </Badge>
      );
    }
    if (internship.isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 gap-1">
          <Eye className="w-3 h-3" /> Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <EyeOff className="w-3 h-3" /> Inactive
      </Badge>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" data-testid="text-page-title">
              <FileText className="w-6 h-6 text-primary" />
              Internship Management
            </h1>
            <p className="text-muted-foreground">Review and moderate all internship postings</p>
          </div>
          {pendingInternships.length > 0 && (
            <Badge variant="destructive" className="text-sm">
              {pendingInternships.length} Pending Review
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending" className="gap-2">
              Pending Review
              {pendingInternships.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingInternships.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              Approved ({approvedInternships.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">
              Rejected ({rejectedInternships.length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({internships.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title or company..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-internships"
              />
            </div>
          </CardContent>
        </Card>

        {activeTab === "pending" && pendingInternships.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Review Required</p>
              <p className="text-sm text-yellow-700">
                These internships are waiting for your approval before they become visible to students.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredInternships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-30" />
              <p>
                {activeTab === "pending" 
                  ? "No internships pending review" 
                  : `No ${activeTab} internships found`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredInternships.map((internship) => (
              <Card 
                key={internship.id} 
                className={`${internship.approvalStatus === "rejected" ? 'opacity-60 bg-slate-50' : ''}`} 
                data-testid={`internship-card-${internship.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg">{internship.title}</h3>
                            {getStatusBadge(internship)}
                          </div>
                          <p className="text-muted-foreground text-sm">{internship.company}</p>
                          
                          {internship.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              <strong>Rejection reason:</strong> {internship.rejectionReason}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" /> {internship.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {internship.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" /> {internship.stipend}
                            </span>
                            <Badge variant="outline">{internship.type}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {internship.skills.split(",").slice(0, 4).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill.trim()}
                              </Badge>
                            ))}
                            {internship.skills.split(",").length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{internship.skills.split(",").length - 4} more
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                            {internship.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:flex-col md:items-end">
                      {internship.approvalStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-2"
                            onClick={() => handleApprove(internship.id)}
                            disabled={actionLoading === internship.id}
                            data-testid={`button-approve-${internship.id}`}
                          >
                            {actionLoading === internship.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                            onClick={() => handleRejectClick(internship)}
                            disabled={actionLoading === internship.id}
                            data-testid={`button-reject-${internship.id}`}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {internship.approvalStatus === "approved" && (
                        internship.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleStatusChange(internship.id, false)}
                            disabled={actionLoading === internship.id}
                            data-testid={`button-deactivate-${internship.id}`}
                          >
                            {actionLoading === internship.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <EyeOff className="w-4 h-4 mr-2" />
                            )}
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleStatusChange(internship.id, true)}
                            disabled={actionLoading === internship.id}
                            data-testid={`button-activate-${internship.id}`}
                          >
                            {actionLoading === internship.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Eye className="w-4 h-4 mr-2" />
                            )}
                            Activate
                          </Button>
                        )
                      )}
                      
                      <span className="text-xs text-muted-foreground">
                        Posted: {internship.createdAt 
                          ? new Date(internship.createdAt).toLocaleDateString() 
                          : "N/A"
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Internship</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this internship. The employer will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Internship: {selectedInternship?.title}</p>
              <p className="text-sm text-muted-foreground">Company: {selectedInternship?.company}</p>
            </div>
            <Textarea
              placeholder="Enter rejection reason (optional)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              data-testid="textarea-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectDialogOpen(false)}
              data-testid="button-cancel-reject"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionLoading === selectedInternship?.id}
              data-testid="button-confirm-reject"
            >
              {actionLoading === selectedInternship?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Reject Internship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
