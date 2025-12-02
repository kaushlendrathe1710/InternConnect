import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth, authFetch } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Building2, 
  FileText, 
  Briefcase,
  Shield,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
  Loader2,
  MessageSquare
} from "lucide-react";
import { Link } from "wouter";

interface AdminStats {
  students: number;
  employers: number;
  admins: number;
  internships: number;
  applications: number;
  conversations: number;
  messages: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authFetch("/api/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { 
      label: "Total Students", 
      value: stats.students.toLocaleString(), 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      link: "/admin/users?role=student"
    },
    { 
      label: "Total Employers", 
      value: stats.employers.toLocaleString(), 
      icon: Building2, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      link: "/admin/users?role=employer"
    },
    { 
      label: "Active Internships", 
      value: stats.internships.toLocaleString(), 
      icon: FileText, 
      color: "text-green-600", 
      bg: "bg-green-50",
      link: "/admin/internships"
    },
    { 
      label: "Applications", 
      value: stats.applications.toLocaleString(), 
      icon: Briefcase, 
      color: "text-orange-600", 
      bg: "bg-orange-50",
      link: "/admin/applications"
    },
    { 
      label: "Conversations", 
      value: stats.conversations.toLocaleString(), 
      icon: MessageSquare, 
      color: "text-pink-600", 
      bg: "bg-pink-50",
      link: "/admin/messages"
    },
  ] : [];

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" data-testid="text-page-title">
              {user?.isSuperAdmin ? (
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              ) : (
                <Shield className="w-6 h-6 text-primary" />
              )}
              {user?.isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {user?.isSuperAdmin 
                ? "Full platform control and admin management" 
                : "Platform overview and moderation tools"
              }
            </p>
          </div>
          {user?.isSuperAdmin && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Link key={index} href={stat.link}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                View, verify, and manage student and employer accounts.
              </p>
              <div className="flex gap-2">
                <Link href="/admin/users">
                  <Button size="sm" data-testid="button-manage-users">Manage Users</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Internship Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Review, approve, or remove internship postings.
              </p>
              <div className="flex gap-2">
                <Link href="/admin/internships">
                  <Button size="sm" data-testid="button-manage-internships">View Internships</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                View platform metrics and growth statistics.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled data-testid="button-view-analytics">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Super Admin Only Section */}
        {user?.isSuperAdmin && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Super Admin Controls
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-600" />
                    Admin Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Create new admin accounts and manage admin permissions.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/admin/manage-admins">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700" data-testid="button-manage-admins">
                        Manage Admins
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-600" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Configure platform settings and system preferences.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled data-testid="button-system-settings">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Admin Stats Summary */}
        {stats && stats.admins > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.students}</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.employers}</div>
                  <div className="text-xs text-muted-foreground">Employers</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.admins}</div>
                  <div className="text-xs text-muted-foreground">Admins</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.internships}</div>
                  <div className="text-xs text-muted-foreground">Internships</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.applications}</div>
                  <div className="text-xs text-muted-foreground">Applications</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
