import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Briefcase, GraduationCap, ChevronRight, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { MOCK_INTERNSHIPS, Internship } from "@/lib/mockData";
import { InternshipCard } from "@/components/ui/internship-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-[0.03]" />
        <div className="container mx-auto px-4 pt-20 pb-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
              Make your dream career a <span className="text-primary relative inline-block">
                reality
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Trending on InternConnect: <span className="font-medium text-foreground">10,000+</span> internships with stipends up to <span className="font-medium text-foreground">₹45,000/month</span>.
            </p>

            <div className="relative max-w-xl mx-auto">
              <div className="flex shadow-lg rounded-full p-1.5 bg-white border border-gray-200 items-center">
                <div className="pl-4 text-muted-foreground">
                  <Search className="w-5 h-5" />
                </div>
                <Input 
                  className="border-0 shadow-none focus-visible:ring-0 text-base h-12 placeholder:text-muted-foreground/70" 
                  placeholder="What are you looking for? (e.g. Web Design)" 
                />
                <Button size="lg" className="rounded-full px-8 h-11 font-semibold">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="border-b bg-slate-50/50">
        <div className="container mx-auto px-4 py-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
             {[
               { label: "Companies Hiring", value: "150K+" },
               { label: "New Openings", value: "10K+" },
               { label: "Active Students", value: "21M+" },
               { label: "Learners", value: "600K+" }
             ].map((stat, i) => (
               <div key={i} className="space-y-1">
                 <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                 <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Trending Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
             <p className="text-muted-foreground">Explore the most sought-after internships</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Work from Home", "Bangalore", "Delhi", "Engineering", 
              "MBA", "Part-time", "Human Resources", "Law",
              "Architecture", "Graphic Design", "Media", "Teaching"
            ].map((cat) => (
              <Link key={cat} href="/search">
                <a className="group flex flex-col items-center justify-center p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="mb-3 p-3 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors">
                     <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-semibold text-sm group-hover:text-primary transition-colors">{cat}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
             <div>
                <h2 className="text-3xl font-bold mb-2">Latest Internships</h2>
                <p className="text-muted-foreground">Apply to the newest opportunities</p>
             </div>
             <Link href="/search">
               <Button variant="ghost" className="text-primary hover:bg-primary/5">View all internships <ChevronRight className="w-4 h-4 ml-1" /></Button>
             </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {MOCK_INTERNSHIPS.slice(0, 3).map((internship: Internship) => (
               <InternshipCard key={internship.id} internship={internship} />
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-10 transform rotate-12">
            <Briefcase size={300} />
         </div>
         <div className="absolute bottom-0 left-0 p-8 opacity-10 transform -rotate-12">
            <GraduationCap size={200} />
         </div>
         
         <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Empower your career with InternConnect</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join millions of students and find the perfect launchpad for your career. 
              Whether you're looking for a summer internship or your first job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button size="lg" variant="secondary" className="text-primary font-bold px-8 shadow-xl hover:scale-105 transition-transform">
                 Register Now
               </Button>
               <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 font-semibold px-8">
                 Post an Internship
               </Button>
            </div>
         </div>
      </section>
      
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-bold text-white mb-4">Internships</h4>
            <ul className="space-y-2">
              <li>Computer Science</li>
              <li>Marketing</li>
              <li>Finance</li>
              <li>Design</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Locations</h4>
            <ul className="space-y-2">
              <li>Bangalore</li>
              <li>Mumbai</li>
              <li>Delhi</li>
              <li>Remote</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">About</h4>
            <ul className="space-y-2">
              <li>About Us</li>
              <li>We're Hiring</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Connect</h4>
            <p className="mb-4 text-xs text-slate-400">Stay updated with the latest opportunities.</p>
            <div className="flex gap-2">
               <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary cursor-pointer transition-colors">f</div>
               <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary cursor-pointer transition-colors">in</div>
               <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary cursor-pointer transition-colors">t</div>
            </div>
          </div>
        </div>
        
        {/* Admin Login Link */}
        <div className="container mx-auto px-4 mt-8 pt-6 border-t border-slate-800">
          <div className="flex justify-center">
            <Link href="/login?role=admin">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                data-testid="button-admin-login"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
