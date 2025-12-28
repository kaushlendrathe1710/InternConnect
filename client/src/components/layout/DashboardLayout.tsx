import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Bookmark, 
  Settings, 
  LogOut,
  PlusCircle,
  Users,
  MessageSquare,
  Menu,
  X,
  Search,
  User,
  ChevronDown,
  Shield,
  ShieldCheck,
  UserPlus,
  ClipboardList,
  Building
} from "lucide-react";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "employer" | "admin";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/internships", label: "Find Internships", icon: Search },
    { href: "/student/jobs", label: "Find Jobs", icon: Building },
    { href: "/student/applications", label: "My Applications", icon: Briefcase },
    { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/student/messages", label: "Messages", icon: MessageSquare },
    { href: "/student/resume", label: "Edit Resume", icon: FileText },
    { href: "/student/bookmarks", label: "Bookmarks", icon: Bookmark },
  ];

  const employerLinks = [
    { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employer/post", label: "Post Internship", icon: PlusCircle },
    { href: "/employer/jobs", label: "Manage Jobs", icon: Building },
    { href: "/employer/applications", label: "Applications", icon: Users },
    { href: "/employer/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/employer/messages", label: "Messages", icon: MessageSquare },
    { href: "/employer/company-profile", label: "Company Profile", icon: Briefcase },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/internships", label: "Internships", icon: FileText },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  ];

  const superAdminLinks = user?.isSuperAdmin ? [
    { href: "/admin/manage-admins", label: "Manage Admins", icon: UserPlus },
  ] : [];

  const links = role === "student" 
    ? studentLinks 
    : role === "employer" 
      ? employerLinks 
      : [...adminLinks, ...superAdminLinks];
  
  const settingsHref = role === "student" 
    ? "/student/settings" 
    : role === "employer" 
      ? "/employer/settings" 
      : "/admin/dashboard";

  const userName = user?.name || user?.email?.split('@')[0] || (role === 'student' ? 'Student' : role === 'employer' ? 'Employer' : 'Admin');
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center space-x-2">
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
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <NotificationBell />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
                data-testid="button-profile-menu"
              >
                <span className="text-sm text-muted-foreground hidden md:inline-block">
                  {userName}
                </span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {userInitials}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => navigate(settingsHref)}
                data-testid="menu-profile"
              >
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => navigate(settingsHref)}
                data-testid="menu-settings"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:static
          inset-y-0 left-0
          w-64 bg-white border-r
          flex flex-col
          z-50 md:z-auto
          transition-transform duration-200
          mt-16 md:mt-0
        `}>
          <div className="p-4 space-y-1 flex-1">
             {links.map((link) => (
               <Link 
                 key={link.href} 
                 href={link.href}
                 className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                   location === link.href 
                     ? "bg-blue-50 text-primary" 
                     : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
                 }`}
                 onClick={() => setMobileMenuOpen(false)}
                 data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
               >
                 <link.icon className={`w-4 h-4 ${location === link.href ? "text-primary" : "text-slate-400"}`} />
                 {link.label}
               </Link>
             ))}

             {role !== "admin" && (
               <div className="pt-4 mt-4 border-t">
                 <Link 
                   href={settingsHref}
                   className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                     location === settingsHref
                       ? "bg-blue-50 text-primary" 
                       : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
                   }`}
                   onClick={() => setMobileMenuOpen(false)}
                   data-testid="nav-settings"
                 >
                   <Settings className={`w-4 h-4 ${location === settingsHref ? "text-primary" : "text-slate-400"}`} /> Settings
                 </Link>
               </div>
             )}
          </div>
          
          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
              data-testid="nav-logout"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto h-[calc(100vh-64px)]">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
