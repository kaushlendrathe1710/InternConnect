import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-8 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="bg-primary rounded-md p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight text-primary">
              InternConnect
            </span>
          </Link>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/search" className={`hover:text-primary transition-colors ${location === '/search' ? 'text-primary' : ''}`}>
              Internships
            </Link>
            <Link href="/search" className="hover:text-primary transition-colors">
              Jobs
            </Link>
            <Link href="/search" className="hover:text-primary transition-colors">
              Courses
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
              <span className="font-bold text-lg text-primary">InternConnect</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                 <Link 
                   href={user.role === 'employer' ? '/employer/dashboard' : (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard')}
                   className="text-sm font-medium hover:text-primary"
                 >
                   Dashboard
                 </Link>
                 <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                 </Button>
              </div>
            ) : (
              <>
                <Link 
                  href="/auth"
                  className="hidden sm:inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 px-3 hover:bg-accent hover:text-accent-foreground"
                  data-testid="button-login"
                >
                  Login
                </Link>
                <Link 
                  href="/login?role=admin"
                  className="hidden sm:inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium h-8 px-3 hover:bg-accent hover:text-accent-foreground"
                  data-testid="button-admin-login-nav"
                >
                  <Shield className="w-4 h-4" />
                  Admin Login
                </Link>
              </>
            )}
            
            {!user && (
               <Link 
                 href="/employer/dashboard"
                 className="hidden lg:inline-flex ml-2 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary text-primary-foreground text-sm font-semibold h-8 px-4 hover:bg-primary/90"
               >
                 Hire Talent
               </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
