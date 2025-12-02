import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Clock, 
  Building2, 
  IndianRupee,
  Bookmark,
  BookmarkCheck,
  Users,
  Calendar,
  Filter,
  Briefcase,
  X,
  ChevronDown
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  type: "internship" | "job";
  postedOn: string;
  applicants: number;
  skills: string[];
  isRemote: boolean;
  hasJobOffer: boolean;
}

export default function StudentInternships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const internships: Internship[] = [
    {
      id: 1,
      title: "Full Stack Developer Intern",
      company: "Flipkart",
      location: "Bangalore",
      stipend: "₹40,000/month",
      duration: "6 months",
      type: "internship",
      postedOn: "2 days ago",
      applicants: 234,
      skills: ["React", "Node.js", "MongoDB"],
      isRemote: false,
      hasJobOffer: true
    },
    {
      id: 2,
      title: "Frontend Developer Intern",
      company: "Swiggy",
      location: "Remote",
      stipend: "₹35,000/month",
      duration: "3 months",
      type: "internship",
      postedOn: "1 day ago",
      applicants: 156,
      skills: ["React", "JavaScript", "CSS"],
      isRemote: true,
      hasJobOffer: false
    },
    {
      id: 3,
      title: "Data Science Intern",
      company: "Razorpay",
      location: "Bangalore (Hybrid)",
      stipend: "₹50,000/month",
      duration: "4 months",
      type: "internship",
      postedOn: "3 days ago",
      applicants: 312,
      skills: ["Python", "Machine Learning", "SQL"],
      isRemote: false,
      hasJobOffer: true
    },
    {
      id: 4,
      title: "UI/UX Design Intern",
      company: "Zomato",
      location: "Gurgaon",
      stipend: "₹25,000/month",
      duration: "2 months",
      type: "internship",
      postedOn: "5 days ago",
      applicants: 189,
      skills: ["Figma", "UI Design", "Prototyping"],
      isRemote: false,
      hasJobOffer: false
    },
    {
      id: 5,
      title: "Backend Engineering Intern",
      company: "PhonePe",
      location: "Bangalore",
      stipend: "₹45,000/month",
      duration: "6 months",
      type: "internship",
      postedOn: "1 week ago",
      applicants: 267,
      skills: ["Java", "Spring Boot", "PostgreSQL"],
      isRemote: false,
      hasJobOffer: true
    },
    {
      id: 6,
      title: "Product Management Intern",
      company: "CRED",
      location: "Bangalore",
      stipend: "₹30,000/month",
      duration: "3 months",
      type: "internship",
      postedOn: "4 days ago",
      applicants: 445,
      skills: ["Product Strategy", "Analytics", "Communication"],
      isRemote: false,
      hasJobOffer: false
    },
    {
      id: 7,
      title: "DevOps Engineer Intern",
      company: "Meesho",
      location: "Remote",
      stipend: "₹40,000/month",
      duration: "5 months",
      type: "internship",
      postedOn: "2 days ago",
      applicants: 123,
      skills: ["AWS", "Docker", "Kubernetes"],
      isRemote: true,
      hasJobOffer: true
    },
    {
      id: 8,
      title: "Content Writing Intern",
      company: "Unacademy",
      location: "Remote",
      stipend: "₹15,000/month",
      duration: "2 months",
      type: "internship",
      postedOn: "6 days ago",
      applicants: 534,
      skills: ["Content Writing", "SEO", "Research"],
      isRemote: true,
      hasJobOffer: false
    }
  ];

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const filteredInternships = internships.filter(internship =>
    internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    internship.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" /> Profile
        </label>
        <div className="space-y-2">
          {["Web Development", "Data Science", "Design", "Marketing", "Content Writing"].map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox id={`profile-${item}`} data-testid={`checkbox-profile-${item.toLowerCase().replace(/\s+/g, '-')}`} />
              <label htmlFor={`profile-${item}`} className="text-sm text-slate-600 cursor-pointer">
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" /> Location
        </label>
        <div className="space-y-2">
          {["Work from Home", "Bangalore", "Mumbai", "Delhi NCR", "Hyderabad"].map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox id={`location-${item}`} data-testid={`checkbox-location-${item.toLowerCase().replace(/\s+/g, '-')}`} />
              <label htmlFor={`location-${item}`} className="text-sm text-slate-600 cursor-pointer">
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <label className="text-sm font-medium">Minimum Stipend</label>
        <Slider defaultValue={[0]} max={50000} step={5000} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹0</span>
          <span>₹25k</span>
          <span>₹50k+</span>
        </div>
      </div>

      <Separator />

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="more-filters" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            More Filters
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="job-offer" data-testid="checkbox-job-offer" />
              <label htmlFor="job-offer" className="text-sm text-slate-600 cursor-pointer">
                With job offer
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="part-time" data-testid="checkbox-part-time" />
              <label htmlFor="part-time" className="text-sm text-slate-600 cursor-pointer">
                Part-time allowed
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="fast-response" data-testid="checkbox-fast-response" />
              <label htmlFor="fast-response" className="text-sm text-slate-600 cursor-pointer">
                Fast response
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full" variant="outline" data-testid="button-clear-filters">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Find Internships</h1>
          <p className="text-muted-foreground">Discover opportunities that match your skills and interests</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by role, company, or skill..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden" data-testid="button-filters-mobile">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
                  <FilterSidebar />
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="button-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="stipend">Highest Stipend</SelectItem>
                <SelectItem value="applicants">Most Applied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="hidden lg:block w-64 shrink-0">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <FilterSidebar />
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{filteredInternships.length} internships found</span>
            </div>

            {filteredInternships.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No internships found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredInternships.map((internship) => (
                <Card 
                  key={internship.id} 
                  className="hover:shadow-md transition-shadow"
                  data-testid={`card-internship-${internship.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
                          {internship.company.charAt(0)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900" data-testid={`text-title-${internship.id}`}>
                              {internship.title}
                            </h3>
                            {internship.hasJobOffer && (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                                Job Offer
                              </Badge>
                            )}
                            {internship.isRemote && (
                              <Badge variant="outline" className="text-xs">Remote</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" /> {internship.company}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {internship.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" /> {internship.stipend}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {internship.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {internship.applicants} applicants
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {internship.skills.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs font-normal">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {internship.postedOn}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleBookmark(internship.id)}
                            className={bookmarked.includes(internship.id) ? "text-primary" : ""}
                            data-testid={`button-bookmark-${internship.id}`}
                          >
                            {bookmarked.includes(internship.id) 
                              ? <BookmarkCheck className="w-5 h-5" />
                              : <Bookmark className="w-5 h-5" />
                            }
                          </Button>
                          <Button size="sm" data-testid={`button-apply-${internship.id}`}>
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {filteredInternships.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" data-testid="button-load-more">Load More</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
