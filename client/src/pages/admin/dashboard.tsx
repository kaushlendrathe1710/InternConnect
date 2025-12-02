import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Shield
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Students", value: "12,450", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Employers", value: "850", icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active Internships", value: "2,300", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Approvals", value: "45", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const pendingCompanies = [
    { id: 1, name: "InnovateX Tech", type: "IT Services", joined: "2 hours ago", status: "Pending" },
    { id: 2, name: "GreenEarth Solutions", type: "NGO", joined: "5 hours ago", status: "Pending" },
    { id: 3, name: "Alpha Finance", type: "Fintech", joined: "1 day ago", status: "Pending" },
  ];

  const flaggedInternships = [
    { id: 101, title: "Quick Money Scheme", company: "BizGrowth Ltd", reason: "Suspicious Content", reportedBy: "3 Users" },
    { id: 102, title: "Unpaid Full Time Dev", company: "StartupX", reason: "Policy Violation", reportedBy: "1 User" },
  ];

  return (
    <DashboardLayout role="student"> {/* Reusing layout, role prop is just for context in this mockup */}
       <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Platform overview and moderation tools.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline">System Logs</Button>
             <Button>Export Reports</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
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
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Pending Company Approvals */}
           <Card>
             <CardHeader>
               <CardTitle className="text-lg font-semibold flex items-center justify-between">
                 <span>Pending Company Verifications</span>
                 <Badge variant="secondary">3 New</Badge>
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                     <tr>
                       <th className="px-6 py-3">Company</th>
                       <th className="px-6 py-3">Joined</th>
                       <th className="px-6 py-3 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {pendingCompanies.map((company) => (
                       <tr key={company.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-4">
                           <div className="font-medium text-slate-900">{company.name}</div>
                           <div className="text-slate-500 text-xs">{company.type}</div>
                         </td>
                         <td className="px-6 py-4 text-slate-500">{company.joined}</td>
                         <td className="px-6 py-4 text-right space-x-2">
                           <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                             <CheckCircle2 className="w-5 h-5" />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                             <XCircle className="w-5 h-5" />
                           </Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
                <div className="p-4 border-t text-center">
                  <Button variant="link" size="sm">View All Requests</Button>
                </div>
             </CardContent>
           </Card>

           {/* Content Moderation */}
           <Card>
             <CardHeader>
               <CardTitle className="text-lg font-semibold flex items-center justify-between">
                 <span className="flex items-center gap-2 text-red-600">
                   <AlertTriangle className="w-5 h-5" /> Flagged Content
                 </span>
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                     <tr>
                       <th className="px-6 py-3">Internship</th>
                       <th className="px-6 py-3">Reason</th>
                       <th className="px-6 py-3 text-right">Review</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {flaggedInternships.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-4">
                           <div className="font-medium text-slate-900 truncate max-w-[150px]" title={item.title}>{item.title}</div>
                           <div className="text-slate-500 text-xs">{item.company}</div>
                         </td>
                         <td className="px-6 py-4">
                           <Badge variant="destructive" className="font-normal text-xs">
                             {item.reason}
                           </Badge>
                           <div className="text-xs text-muted-foreground mt-1">By {item.reportedBy}</div>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <Button variant="outline" size="sm" className="h-8">Review</Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             </CardContent>
           </Card>
        </div>
       </div>
    </DashboardLayout>
  );
}
