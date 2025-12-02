import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Bookmark, 
  Settings, 
  LogOut,
  PlusCircle,
  Users,
  MessageSquare
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "employer";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [location] = useLocation();

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/applications", label: "My Applications", icon: Briefcase },
    { href: "/student/resume", label: "Edit Resume", icon: FileText },
    { href: "/student/bookmarks", label: "Bookmarks", icon: Bookmark },
  ];

  const employerLinks = [
    { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employer/post", label: "Post Internship", icon: PlusCircle },
    { href: "/employer/applications", label: "Applications", icon: Users },
    { href: "/employer/messages", label: "Messages", icon: MessageSquare },
  ];

  const links = role === "student" ? studentLinks : employerLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30">
        <Link href="/">
          <a className="flex items-center space-x-2">
             <div className="bg-primary rounded-md p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-primary hidden md:block">
                InternConnect
              </span>
          </a>
        </Link>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            Welcome, {role === 'student' ? 'Rahul' : 'TechNova HR'}
          </span>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {role === 'student' ? 'RS' : 'TN'}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r hidden md:flex flex-col">
          <div className="p-4 space-y-1 flex-1">
             {links.map((link) => (
               <Link key={link.href} href={link.href}>
                 <a className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                   location === link.href 
                     ? "bg-blue-50 text-primary" 
                     : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
                 }`}>
                   <link.icon className={`w-4 h-4 ${location === link.href ? "text-primary" : "text-slate-400"}`} />
                   {link.label}
                 </a>
               </Link>
             ))}

             <div className="pt-4 mt-4 border-t">
               <Link href="/settings">
                 <a className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-foreground transition-colors">
                   <Settings className="w-4 h-4 text-slate-400" /> Settings
                 </a>
               </Link>
             </div>
          </div>
          
          <div className="p-4 border-t">
            <Link href="/">
              <a className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </a>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto h-[calc(100vh-64px)]">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
