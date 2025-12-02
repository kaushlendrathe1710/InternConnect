import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  FileText, 
  Eye, 
  MoreHorizontal, 
  Search,
  PlusCircle,
  Filter,
  TrendingUp,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EmployerDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const postings = [
    {
      id: 1,
      role: "Full Stack Developer Intern",
      location: "Remote",
      postedOn: "2 days ago",
      views: 1240,
      applications: 145,
      newApplications: 12,
      status: "Active"
    },
    {
      id: 2,
      role: "Social Media Marketing Intern",
      location: "Mumbai",
      postedOn: "1 week ago",
      views: 850,
      applications: 89,
      newApplications: 8,
      status: "Active"
    },
    {
      id: 3,
      role: "Business Development Associate",
      location: "Delhi",
      postedOn: "3 weeks ago",
      views: 2100,
      applications: 320,
      newApplications: 0,
      status: "Closed"
    }
  ];

  const totalApplicants = postings.reduce((sum, p) => sum + p.applications, 0);
  const totalViews = postings.reduce((sum, p) => sum + p.views, 0);
  const activeJobs = postings.filter(p => p.status === "Active").length;

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <DashboardLayout role="employer">
      <div className="space-y-8">
        {/* Welcome Section */}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/employer/post")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <h3 className="text-2xl font-bold" data-testid="text-active-jobs">{activeJobs}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/employer/applications")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
                <h3 className="text-2xl font-bold" data-testid="text-total-applicants">{totalApplicants}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <h3 className="text-2xl font-bold" data-testid="text-total-views">{formatViews(totalViews)}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Postings Section */}
        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h2 className="text-lg font-semibold flex items-center gap-2">
               <FileText className="w-5 h-5 text-muted-foreground" /> Your Postings
             </h2>
             
             <div className="flex gap-2">
                <div className="relative w-64 hidden md:block">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Search jobs..." className="pl-9 h-9" data-testid="input-search-jobs" />
                </div>
                <Button variant="outline" size="sm" className="gap-2 h-9" data-testid="button-filter">
                   <Filter className="w-4 h-4" /> Filter
                </Button>
             </div>
           </div>
           
           <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                   <tr>
                     <th className="px-6 py-4">Job Title</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Views</th>
                     <th className="px-6 py-4">Applications</th>
                     <th className="px-6 py-4 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {postings.map((job) => (
                     <tr key={job.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-posting-${job.id}`}>
                       <td className="px-6 py-4">
                         <div className="font-medium text-slate-900">{job.role}</div>
                         <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                           {job.location} • Posted {job.postedOn}
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <Badge variant="outline" className={`font-normal ${
                           job.status === 'Active' 
                             ? 'bg-green-50 text-green-700 border-green-200' 
                             : 'bg-slate-100 text-slate-600 border-slate-200'
                         }`}>
                           {job.status}
                         </Badge>
                       </td>
                       <td className="px-6 py-4 text-slate-600">
                         {job.views.toLocaleString()}
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <span className="font-medium">{job.applications}</span>
                           {job.newApplications > 0 && (
                             <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                               +{job.newApplications} new
                             </span>
                           )}
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="text-primary hover:text-primary/80 hover:bg-blue-50 mr-2"
                           onClick={() => navigate(`/employer/applications?posting=${job.id}`)}
                           data-testid={`button-view-applicants-${job.id}`}
                         >
                           View Applicants
                         </Button>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${job.id}`}>
                               <MoreHorizontal className="w-4 h-4 text-slate-400" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => navigate(`/employer/edit/${job.id}`)}>
                               Edit Posting
                             </DropdownMenuItem>
                             <DropdownMenuItem>Duplicate</DropdownMenuItem>
                             <DropdownMenuItem className="text-red-600">
                               {job.status === 'Active' ? 'Close Posting' : 'Delete'}
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             {postings.length === 0 && (
               <div className="p-12 text-center">
                 <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                 <h3 className="font-medium text-lg mb-2">No postings yet</h3>
                 <p className="text-muted-foreground mb-4">Create your first internship posting to start receiving applications</p>
                 <Button onClick={() => navigate("/employer/post")}>
                   <PlusCircle className="w-4 h-4 mr-2" /> Post Internship
                 </Button>
               </div>
             )}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
