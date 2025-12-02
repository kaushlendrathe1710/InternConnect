import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  EyeOff
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
  createdAt: string | null;
}

export default function AdminInternships() {
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/internships");
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

  const handleStatusChange = async (internshipId: number, isActive: boolean) => {
    setActionLoading(internshipId);
    try {
      const response = await fetch(`/api/admin/internships/${internshipId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = 
      internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && internship.isActive;
    if (statusFilter === "inactive") return matchesSearch && !internship.isActive;
    return matchesSearch;
  });

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
          <Badge variant="outline" className="text-sm">
            {filteredInternships.length} Internships
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by title or company..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-internships"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Internships List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredInternships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-30" />
              <p>No internships found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredInternships.map((internship) => (
              <Card key={internship.id} className={`${!internship.isActive ? 'opacity-60 bg-slate-50' : ''}`} data-testid={`internship-card-${internship.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{internship.title}</h3>
                            {internship.isActive ? (
                              <Badge className="bg-green-100 text-green-800 gap-1">
                                <Eye className="w-3 h-3" /> Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <EyeOff className="w-3 h-3" /> Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{internship.company}</p>
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
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:flex-col">
                      {internship.isActive ? (
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
                            <XCircle className="w-4 h-4 mr-2" />
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
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Activate
                        </Button>
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
    </DashboardLayout>
  );
}
