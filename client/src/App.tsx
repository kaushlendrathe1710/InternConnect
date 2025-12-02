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
import EmployerDashboard from "@/pages/employer/dashboard";
import PostInternship from "@/pages/employer/post-internship";
import AdminDashboard from "@/pages/admin/dashboard";
import AuthPage from "@/pages/auth/auth-page";
import RoleSelection from "@/pages/auth/role-selection";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/search" component={SearchPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/onboarding" component={RoleSelection} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/applications" component={StudentApplications} />
      <Route path="/student/resume" component={StudentResume} />
      <Route path="/student/bookmarks" component={StudentBookmarks} />
      <Route path="/student/settings" component={StudentSettings} />
      
      {/* Employer Routes */}
      <Route path="/employer/dashboard" component={EmployerDashboard} />
      <Route path="/employer/applications" component={EmployerDashboard} />
      <Route path="/employer/post" component={PostInternship} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
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
