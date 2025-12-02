import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SearchPage from "@/pages/search";
import StudentDashboard from "@/pages/student/dashboard";
import StudentApplications from "@/pages/student/applications";
import StudentResume from "@/pages/student/resume";
import StudentBookmarks from "@/pages/student/bookmarks";
import StudentSettings from "@/pages/student/settings";
import StudentInternships from "@/pages/student/internships";
import StudentMessages from "@/pages/student/messages";
import EmployerDashboard from "@/pages/employer/dashboard";
import PostInternship from "@/pages/employer/post-internship";
import EmployerApplications from "@/pages/employer/applications";
import EmployerMessages from "@/pages/employer/messages";
import EmployerSettings from "@/pages/employer/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminInternships from "@/pages/admin/internships";
import AdminMessages from "@/pages/admin/messages";
import ManageAdmins from "@/pages/admin/manage-admins";
import AuthPage from "@/pages/auth/auth-page";
import RoleSelection from "@/pages/auth/role-selection";
import AdminLogin from "@/pages/auth/admin-login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/search" component={SearchPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/onboarding" component={RoleSelection} />
      <Route path="/login" component={AdminLogin} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/applications" component={StudentApplications} />
      <Route path="/student/resume" component={StudentResume} />
      <Route path="/student/bookmarks" component={StudentBookmarks} />
      <Route path="/student/settings" component={StudentSettings} />
      <Route path="/student/internships" component={StudentInternships} />
      <Route path="/student/messages" component={StudentMessages} />
      
      {/* Employer Routes */}
      <Route path="/employer/dashboard" component={EmployerDashboard} />
      <Route path="/employer/post" component={PostInternship} />
      <Route path="/employer/applications" component={EmployerApplications} />
      <Route path="/employer/messages" component={EmployerMessages} />
      <Route path="/employer/settings" component={EmployerSettings} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/internships" component={AdminInternships} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/manage-admins" component={ManageAdmins} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
