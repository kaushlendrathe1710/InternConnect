import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  Clock, 
  Building2, 
  IndianRupee,
  Bookmark,
  BookmarkX,
  ExternalLink,
  Users,
  Calendar,
  Briefcase
} from "lucide-react";

interface BookmarkedItem {
  id: number;
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  type: "internship" | "job";
  postedOn: string;
  applicants: number;
  isActive: boolean;
  skills: string[];
}

export default function StudentBookmarks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const bookmarks: BookmarkedItem[] = [
    {
      id: 1,
      title: "Frontend Developer Intern",
      company: "Flipkart",
      location: "Bangalore",
      stipend: "₹40,000/month",
      duration: "6 months",
      type: "internship",
      postedOn: "2 days ago",
      applicants: 234,
      isActive: true,
      skills: ["React", "JavaScript", "CSS"]
    },
    {
      id: 2,
      title: "Backend Engineering Intern",
      company: "Swiggy",
      location: "Bangalore (Remote)",
      stipend: "₹35,000/month",
      duration: "3 months",
      type: "internship",
      postedOn: "1 week ago",
      applicants: 456,
      isActive: true,
      skills: ["Node.js", "MongoDB", "AWS"]
    },
    {
      id: 3,
      title: "Data Analyst",
      company: "Razorpay",
      location: "Bangalore",
      stipend: "₹8-12 LPA",
      duration: "Full-time",
      type: "job",
      postedOn: "3 days ago",
      applicants: 189,
      isActive: true,
      skills: ["Python", "SQL", "Tableau"]
    },
    {
      id: 4,
      title: "Product Design Intern",
      company: "Zomato",
      location: "Gurgaon",
      stipend: "₹25,000/month",
      duration: "2 months",
      type: "internship",
      postedOn: "2 weeks ago",
      applicants: 312,
      isActive: false,
      skills: ["Figma", "UI/UX", "Prototyping"]
    },
    {
      id: 5,
      title: "Machine Learning Engineer",
      company: "PhonePe",
      location: "Bangalore (Hybrid)",
      stipend: "₹15-20 LPA",
      duration: "Full-time",
      type: "job",
      postedOn: "5 days ago",
      applicants: 567,
      isActive: true,
      skills: ["Python", "TensorFlow", "NLP"]
    }
  ];

  const [savedBookmarks, setSavedBookmarks] = useState<number[]>(bookmarks.map(b => b.id));

  const removeBookmark = (id: number) => {
    setSavedBookmarks(prev => prev.filter(b => b !== id));
  };

  const filteredBookmarks = bookmarks.filter(b => {
    const isSaved = savedBookmarks.includes(b.id);
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "internships" && b.type === "internship") ||
                      (activeTab === "jobs" && b.type === "job");
    return isSaved && matchesSearch && matchesTab;
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Bookmarks</h1>
          <p className="text-muted-foreground">Saved internships and jobs you're interested in</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border">
              <TabsTrigger value="all" data-testid="tab-all">
                All ({savedBookmarks.length})
              </TabsTrigger>
              <TabsTrigger value="internships" data-testid="tab-internships">
                Internships ({bookmarks.filter(b => b.type === "internship" && savedBookmarks.includes(b.id)).length})
              </TabsTrigger>
              <TabsTrigger value="jobs" data-testid="tab-jobs">
                Jobs ({bookmarks.filter(b => b.type === "job" && savedBookmarks.includes(b.id)).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search bookmarks..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {filteredBookmarks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No bookmarks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Try adjusting your search" 
                  : "Save internships and jobs to see them here"
                }
              </p>
              <Button data-testid="button-browse">Browse Opportunities</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBookmarks.map((item) => (
              <Card 
                key={item.id} 
                className={`hover:shadow-md transition-shadow ${!item.isActive ? 'opacity-60' : ''}`}
                data-testid={`card-bookmark-${item.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
                        {item.company.charAt(0)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900" data-testid={`text-title-${item.id}`}>
                            {item.title}
                          </h3>
                          <Badge variant="outline" className={item.type === "internship" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}>
                            {item.type === "internship" ? "Internship" : "Job"}
                          </Badge>
                          {!item.isActive && (
                            <Badge variant="outline" className="bg-red-50 text-red-700">Closed</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> {item.company}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" /> {item.stipend}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {item.applicants} applicants
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Posted {item.postedOn}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeBookmark(item.id)}
                          data-testid={`button-remove-bookmark-${item.id}`}
                        >
                          <BookmarkX className="w-4 h-4 mr-1" /> Remove
                        </Button>
                        <Button 
                          size="sm" 
                          disabled={!item.isActive}
                          data-testid={`button-apply-bookmark-${item.id}`}
                        >
                          {item.isActive ? "Apply Now" : "Closed"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredBookmarks.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredBookmarks.length} saved {filteredBookmarks.length === 1 ? 'opportunity' : 'opportunities'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
