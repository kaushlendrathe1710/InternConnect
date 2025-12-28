import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth, authFetch } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Building2, 
  Bell, 
  Shield, 
  Globe,
  Mail,
  Phone,
  MapPin,
  Upload,
  Users,
  LogOut,
  Trash2,
  AlertTriangle,
  Link as LinkIcon,
  Loader2,
  Clock
} from "lucide-react";

interface CompanyProfile {
  id: number;
  userId: number;
  companyName: string | null;
  industry: string | null;
  companySize: string | null;
  foundedYear: string | null;
  about: string | null;
  website: string | null;
  address: string | null;
  logoUrl: string | null;
}

export default function EmployerSettings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [about, setAbout] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newApplicationAlerts, setNewApplicationAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 2MB.",
          variant: "destructive",
        });
        return;
      }
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PNG or JPG image only.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        toast({
          title: "Logo uploaded",
          description: "Your logo preview is ready. Click Save to apply changes.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const { data: companyProfile, isLoading } = useQuery<CompanyProfile | null>({
    queryKey: ["/api/employer/company-profile"],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await authFetch(`/api/employer/company-profile`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch company profile");
      const data = await res.json();
      return data || null;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (user) {
      setCompanyName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
    if (companyProfile) {
      if (companyProfile.companyName) setCompanyName(companyProfile.companyName);
      if (companyProfile.industry) setIndustry(companyProfile.industry);
      if (companyProfile.companySize) setCompanySize(companyProfile.companySize);
      if (companyProfile.foundedYear) setFoundedYear(companyProfile.foundedYear);
      if (companyProfile.about) setAbout(companyProfile.about);
      if (companyProfile.website) setWebsite(companyProfile.website);
      if (companyProfile.address) setAddress(companyProfile.address);
    }
  }, [user, companyProfile]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const profileData = {
        companyName: companyName || null,
        industry: industry || null,
        companySize: companySize || null,
        foundedYear: foundedYear || null,
        about: about || null,
        website: website || null,
        address: address || null,
      };

      const res = await authFetch("/api/employer/company-profile", {
        method: "POST",
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employer/company-profile"] });
      toast({
        title: "Settings saved",
        description: "Your company profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveProfileMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="employer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Settings</h1>
          <p className="text-muted-foreground">Manage your company profile and preferences</p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="company" className="flex items-center gap-2" data-testid="tab-company">
              <Building2 className="w-4 h-4" /> Company
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2" data-testid="tab-team">
              <Users className="w-4 h-4" /> Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Company Profile
                </CardTitle>
                <CardDescription>This information will be displayed on your job postings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload-logo"
                    >
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input 
                      id="industry" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g., Information Technology"
                      data-testid="input-industry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Input 
                      id="companySize" 
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      placeholder="e.g., 51-200 employees"
                      data-testid="input-company-size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded">Founded Year</Label>
                    <Input 
                      id="founded" 
                      value={foundedYear}
                      onChange={(e) => setFoundedYear(e.target.value)}
                      placeholder="e.g., 2018"
                      data-testid="input-founded"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">About Company</Label>
                  <Textarea 
                    id="about" 
                    placeholder="Tell candidates about your company, culture, and mission..."
                    className="min-h-[120px]"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    data-testid="input-about"
                  />
                </div>

                <Separator />

                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@company.com"
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        className="pl-9"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Office Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="address" 
                        className="pl-9"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your office address"
                        data-testid="input-address"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="website" 
                        className="pl-9"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourcompany.com"
                        data-testid="input-website"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={saveProfileMutation.isPending}
                    data-testid="button-save-company"
                  >
                    {saveProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Email Notifications
                </CardTitle>
                <CardDescription>Choose what emails you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>All Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Master toggle for all email notifications</p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                    data-testid="switch-email-all"
                  />
                </div>
                
                <Separator />

                <div className="space-y-4 pl-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Application Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone applies to your postings</p>
                    </div>
                    <Switch 
                      checked={newApplicationAlerts && emailNotifications} 
                      onCheckedChange={setNewApplicationAlerts}
                      disabled={!emailNotifications}
                      data-testid="switch-new-applications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Report</Label>
                      <p className="text-sm text-muted-foreground">Summary of applications and posting performance</p>
                    </div>
                    <Switch 
                      checked={weeklyReport && emailNotifications} 
                      onCheckedChange={setWeeklyReport}
                      disabled={!emailNotifications}
                      data-testid="switch-weekly-report"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing & Tips</Label>
                      <p className="text-sm text-muted-foreground">Hiring tips and platform updates</p>
                    </div>
                    <Switch 
                      checked={marketingEmails && emailNotifications} 
                      onCheckedChange={setMarketingEmails}
                      disabled={!emailNotifications}
                      data-testid="switch-marketing"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} data-testid="button-save-notifications">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Team Members
                </CardTitle>
                <CardDescription>Manage who has access to your company account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </div>
                  <Badge>Admin</Badge>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowInviteDialog(true)}
                  data-testid="button-invite-member"
                >
                  <Users className="w-4 h-4 mr-2" /> Invite Team Member
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                  <div>
                    <p className="font-medium text-red-700">Log Out</p>
                    <p className="text-sm text-red-600/80">Sign out of your account on this device</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-300 text-red-600 hover:bg-red-100"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                  <div>
                    <p className="font-medium text-red-700">Delete Company Account</p>
                    <p className="text-sm text-red-600/80">Permanently delete your account and all data</p>
                  </div>
                  <Button 
                    variant="destructive"
                    data-testid="button-delete-account"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Coming Soon
            </DialogTitle>
            <DialogDescription>
              Team member invitations are coming soon! This feature will allow you to invite colleagues 
              to help manage your company's internship postings and applications.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowInviteDialog(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
