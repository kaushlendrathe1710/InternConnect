import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  ShieldCheck, 
  Shield,
  UserPlus,
  Mail,
  User,
  Phone,
  Loader2,
  Ban,
  CheckCircle,
  Trash2,
  AlertTriangle
} from "lucide-react";

interface Admin {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  isSuperAdmin: boolean | null;
  isSuspended: boolean | null;
  createdAt: string | null;
}

export default function ManageAdmins() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser?.isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admins can access this page.",
        variant: "destructive",
      });
      setLocation("/admin/dashboard");
      return;
    }

    const fetchAdmins = async () => {
      try {
        const response = await fetch("/api/admin/users?role=admin");
        if (!response.ok) throw new Error("Failed to fetch admins");
        const data = await response.json();
        setAdmins(data);
      } catch (error) {
        console.error("Error fetching admins:", error);
        toast({
          title: "Error",
          description: "Failed to load admin accounts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, [currentUser]);

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminName) {
      toast({
        title: "Error",
        description: "Email and name are required",
        variant: "destructive",
      });
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName,
          phone: newAdminPhone,
          requesterId: currentUser?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create admin");
      }

      const newAdmin = await response.json();
      setAdmins(prev => [newAdmin, ...prev]);
      setCreateDialogOpen(false);
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminPhone("");

      toast({
        title: "Admin Created",
        description: `Admin account for ${newAdminName} has been created. They can now login with OTP.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSuspend = async (adminId: number, suspend: boolean) => {
    setActionLoading(adminId);
    try {
      const response = await fetch(`/api/admin/users/${adminId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: suspend }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update admin");
      }
      
      const updatedAdmin = await response.json();
      setAdmins(prev => prev.map(a => a.id === adminId ? updatedAdmin : a));
      
      toast({
        title: suspend ? "Admin Suspended" : "Admin Reactivated",
        description: `Admin has been ${suspend ? "suspended" : "reactivated"} successfully.`,
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

  const handleDelete = async (adminId: number) => {
    setActionLoading(adminId);
    try {
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete admin");
      }
      
      setAdmins(prev => prev.filter(a => a.id !== adminId));
      
      toast({
        title: "Admin Deleted",
        description: "Admin account has been permanently removed.",
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" data-testid="text-page-title">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              Admin Management
            </h1>
            <p className="text-muted-foreground">Create and manage admin accounts</p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-700"
            data-testid="button-create-admin"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Admin
          </Button>
        </div>

        {/* Warning Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Super Admin Access Only</h4>
              <p className="text-sm text-amber-700">
                Only super admins can create, modify, or delete admin accounts. The super admin account cannot be modified or deleted.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admins List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Accounts ({admins.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {admins.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Shield className="w-12 h-12 mb-4 opacity-30" />
                <p>No admin accounts found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-slate-500">Admin</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-500">Type</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-500">Status</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-500">Created</th>
                    <th className="text-right px-6 py-4 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50/50" data-testid={`admin-row-${admin.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={admin.isSuperAdmin ? "bg-amber-100 text-amber-600" : "bg-purple-100 text-purple-600"}>
                              {admin.name?.split(" ").map(n => n[0]).join("") || admin.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-900">{admin.name || "No name"}</div>
                            <div className="text-xs text-muted-foreground">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {admin.isSuperAdmin ? (
                          <Badge className="bg-amber-100 text-amber-800 gap-1">
                            <ShieldCheck className="w-3 h-3" /> Super Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-100 text-purple-800 gap-1">
                            <Shield className="w-3 h-3" /> Admin
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {admin.isSuspended ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="w-3 h-3" /> Suspended
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 gap-1">
                            <CheckCircle className="w-3 h-3" /> Active
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {admin.createdAt 
                          ? new Date(admin.createdAt).toLocaleDateString() 
                          : "N/A"
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        {admin.isSuperAdmin ? (
                          <Badge variant="outline" className="text-amber-600">
                            Protected
                          </Badge>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {admin.isSuspended ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleSuspend(admin.id, false)}
                                disabled={actionLoading === admin.id}
                                data-testid={`button-reactivate-admin-${admin.id}`}
                              >
                                {actionLoading === admin.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => handleSuspend(admin.id, true)}
                                disabled={actionLoading === admin.id}
                                data-testid={`button-suspend-admin-${admin.id}`}
                              >
                                {actionLoading === admin.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(admin.id)}
                              disabled={actionLoading === admin.id}
                              data-testid={`button-delete-admin-${admin.id}`}
                            >
                              {actionLoading === admin.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Create Admin Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create Admin Account
              </DialogTitle>
              <DialogDescription>
                Create a new admin account. The admin will be able to login using OTP verification.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@company.com"
                    className="pl-9"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    data-testid="input-admin-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-name"
                    type="text"
                    placeholder="Admin Name"
                    className="pl-9"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    data-testid="input-admin-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    className="pl-9"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    data-testid="input-admin-phone"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAdmin}
                disabled={createLoading || !newAdminEmail || !newAdminName}
                className="bg-amber-600 hover:bg-amber-700"
                data-testid="button-confirm-create-admin"
              >
                {createLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
