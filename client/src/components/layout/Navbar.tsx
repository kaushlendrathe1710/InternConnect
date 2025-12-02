import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-8 hidden md:flex">
          <Link href="/">
            <a className="mr-6 flex items-center space-x-2">
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
            </a>
          </Link>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/search">
              <a className={`hover:text-primary transition-colors ${location === '/search' ? 'text-primary' : ''}`}>Internships</a>
            </Link>
            <Link href="/search">
              <a className="hover:text-primary transition-colors">Jobs</a>
            </Link>
            <Link href="/search">
              <a className="hover:text-primary transition-colors">Courses</a>
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Mobile logo shows here if needed, usually hidden on desktop */}
            <Link href="/">
              <a className="mr-6 flex items-center space-x-2 md:hidden">
                <span className="font-bold text-lg text-primary">InternConnect</span>
              </a>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex font-medium">
              Login
            </Button>
            <Button size="sm" className="font-semibold px-6">
              Register
            </Button>
            <Link href="/employer/dashboard">
             <Button variant="outline" size="sm" className="hidden lg:inline-flex ml-2">
               Hire Talent
             </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
