import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MoreHorizontal, 
  MapPin,
  ExternalLink,
  Search
} from "lucide-react";

export default function StudentDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const applications = [
    {
      id: 1,
      role: "Full Stack Developer",
      company: "TechNova Solutions",
      status: "Shortlisted",
      appliedOn: "2 days ago",
      applicants: 145
    },
    {
      id: 2,
      role: "UI/UX Designer",
      company: "CreativePulse",
      status: "Applied",
      appliedOn: "1 week ago",
      applicants: 89
    },
    {
      id: 3,
      role: "Product Management Intern",
      company: "GrowthX",
      status: "Rejected",
      appliedOn: "2 weeks ago",
      applicants: 320
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Shortlisted": return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "Applied": return "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100";
      case "Rejected": return "bg-red-50 text-red-700 hover:bg-red-100 border-red-100";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const userName = user?.name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="text-dashboard-title">Dashboard</h1>
            <p className="text-muted-foreground">Track your applications and profile performance.</p>
          </div>
          <Button 
            className="shadow-sm"
            onClick={() => navigate("/student/internships")}
            data-testid="button-find-internships"
          >
            <Search className="w-4 h-4 mr-2" />
            Find New Internships
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/student/applications")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-primary">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applied</p>
                <h3 className="text-2xl font-bold" data-testid="text-total-applied">12</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/student/applications?status=shortlisted")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
                <h3 className="text-2xl font-bold" data-testid="text-shortlisted">3</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                <h3 className="text-2xl font-bold" data-testid="text-interviews">1</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications Table */}
          <div className="lg:col-span-2 space-y-6">
             <h2 className="text-lg font-semibold flex items-center gap-2">
               <Briefcase className="w-5 h-5 text-muted-foreground" /> Recent Applications
             </h2>
             
             <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                     <tr>
                       <th className="px-6 py-4">Company & Role</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Applied On</th>
                       <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {applications.map((app) => (
                       <tr key={app.id} className="hover:bg-slate-50/50" data-testid={`row-application-${app.id}`}>
                         <td className="px-6 py-4">
                           <div className="font-medium text-slate-900">{app.role}</div>
                           <div className="text-slate-500 text-xs">{app.company}</div>
                         </td>
                         <td className="px-6 py-4">
                           <Badge variant="outline" className={`font-normal ${getStatusColor(app.status)}`}>
                             {app.status}
                           </Badge>
                         </td>
                         <td className="px-6 py-4 text-slate-500">
                           {app.appliedOn}
                         </td>
                         <td className="px-6 py-4 text-right">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8"
                             data-testid={`button-action-${app.id}`}
                           >
                             <MoreHorizontal className="w-4 h-4 text-slate-400" />
                           </Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               <div className="p-4 border-t bg-slate-50/50 text-center">
                 <Button 
                   variant="link" 
                   className="text-primary"
                   onClick={() => navigate("/student/applications")}
                   data-testid="button-view-all-applications"
                 >
                   View All Applications
                 </Button>
               </div>
             </div>
          </div>

          {/* Profile Strength Card */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
               <FileText className="w-5 h-5 text-muted-foreground" /> Profile Strength
            </h2>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2 text-center">
                   <div className="relative inline-flex items-center justify-center">
                      <svg className="w-24 h-24 text-slate-100 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" 
                                strokeDasharray="251.2" strokeDashoffset="62.8" className="text-green-500 transition-all duration-1000 ease-out" />
                      </svg>
                      <span className="absolute text-2xl font-bold text-slate-700" data-testid="text-profile-strength">75%</span>
                   </div>
                   <p className="font-medium text-slate-900">Intermediate</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Actions</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Add Project Portfolio", done: false, action: () => navigate("/student/resume") },
                      { label: "Verify Email", done: true },
                      { label: "Add Skills", done: true },
                      { label: "Upload Resume", done: true }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                        <span className={`${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.label}</span>
                        {item.done 
                          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                          : <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs px-2 text-primary"
                              onClick={item.action}
                              data-testid={`button-action-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              Add
                            </Button>
                        }
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate("/student/resume")}
                  data-testid="button-update-resume"
                >
                  Update Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
