import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  Users, 
  Search,
  Ban,
  CheckCircle,
  Trash2,
  ShieldCheck,
  Loader2,
  UserX,
  UserCheck
} from "lucide-react";

interface User {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  isVerified: boolean | null;
  isSuperAdmin: boolean | null;
  isSuspended: boolean | null;
  createdAt: string | null;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const initialRole = urlParams.get("role") || "all";

  useEffect(() => {
    setRoleFilter(initialRole);
  }, [initialRole]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const url = roleFilter !== "all" 
          ? `/api/admin/users?role=${roleFilter}` 
          : "/api/admin/users";
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [roleFilter]);

  const handleSuspend = async (userId: number, suspend: boolean) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: suspend }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }
      
      const updatedUser = await response.json();
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      
      toast({
        title: suspend ? "User Suspended" : "User Reactivated",
        description: `User has been ${suspend ? "suspended" : "reactivated"} successfully.`,
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

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setActionLoading(userToDelete.id);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }
      
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      
      toast({
        title: "User Deleted",
        description: "User has been permanently removed.",
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getRoleBadge = (role: string, isSuperAdmin: boolean | null) => {
    if (isSuperAdmin) {
      return <Badge className="bg-amber-100 text-amber-800">Super Admin</Badge>;
    }
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case "employer":
        return <Badge className="bg-green-100 text-green-800">Employer</Badge>;
      case "student":
        return <Badge className="bg-blue-100 text-blue-800">Student</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" data-testid="text-page-title">
              <Users className="w-6 h-6 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground">View and manage all platform users</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredUsers.length} Users
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-users"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-role-filter">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="employer">Employers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-30" />
                <p>No users found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-slate-500">User</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-500">Role</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-500">Status</th>
                    <th className="text-left px-6 py-4 font-medium text-slate-500">Joined</th>
                    <th className="text-right px-6 py-4 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50" data-testid={`user-row-${user.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.name?.split(" ").map(n => n[0]).join("") || user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-900">{user.name || "No name"}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role, user.isSuperAdmin)}
                      </td>
                      <td className="px-6 py-4">
                        {user.isSuspended ? (
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
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString() 
                          : "N/A"
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!user.isSuperAdmin && (
                          <div className="flex items-center justify-end gap-2">
                            {user.isSuspended ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleSuspend(user.id, false)}
                                disabled={actionLoading === user.id}
                                data-testid={`button-reactivate-${user.id}`}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => handleSuspend(user.id, true)}
                                disabled={actionLoading === user.id}
                                data-testid={`button-suspend-${user.id}`}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserX className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setUserToDelete(user);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={actionLoading === user.id}
                              data-testid={`button-delete-${user.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {user.isSuperAdmin && (
                          <Badge variant="outline" className="text-amber-600">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Protected
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {userToDelete && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Avatar>
                    <AvatarFallback className="bg-red-100 text-red-600">
                      {userToDelete.name?.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{userToDelete.name || "No name"}</div>
                    <div className="text-sm text-muted-foreground">{userToDelete.email}</div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={actionLoading === userToDelete?.id}
              >
                {actionLoading === userToDelete?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
