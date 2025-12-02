import { Navbar } from "@/components/layout/Navbar";
import { InternshipCard } from "@/components/ui/internship-card";
import { MOCK_INTERNSHIPS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Filter, MapPin, Briefcase } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
         {/* Mobile Filter Toggle - Visible only on small screens */}
         <div className="md:hidden mb-4">
           <Button variant="outline" className="w-full flex items-center justify-center gap-2">
             <Filter className="w-4 h-4" /> Filters
           </Button>
         </div>

         <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Sidebar Filters */}
            <div className="hidden md:block w-72 shrink-0 bg-white rounded-lg border shadow-sm sticky top-20">
              <div className="p-4 border-b flex items-center gap-2 font-semibold text-lg">
                 <Filter className="w-5 h-5 text-primary" /> Filters
              </div>
              
              <ScrollArea className="h-[calc(100vh-150px)]">
                <div className="p-4 space-y-6">
                  
                  {/* Profile/Category */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" /> Profile
                    </label>
                    <div className="space-y-2">
                       {["Web Development", "Digital Marketing", "Graphic Design", "Data Science", "Content Writing"].map((item) => (
                         <div key={item} className="flex items-center space-x-2">
                           <Checkbox id={`cat-${item}`} />
                           <label htmlFor={`cat-${item}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-normal text-slate-600">
                             {item}
                           </label>
                         </div>
                       ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> Location
                    </label>
                    <div className="space-y-2">
                       {["Work from Home", "Bangalore", "Mumbai", "Delhi", "Pune"].map((item) => (
                         <div key={item} className="flex items-center space-x-2">
                           <Checkbox id={`loc-${item}`} />
                           <label htmlFor={`loc-${item}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-normal text-slate-600">
                             {item}
                           </label>
                         </div>
                       ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Stipend */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Min. Stipend (₹)</label>
                    <Slider defaultValue={[0]} max={50000} step={1000} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>25k</span>
                      <span>50k+</span>
                    </div>
                  </div>

                  <Separator />
                  
                  {/* More Filters */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">More Filters</AccordionTrigger>
                      <AccordionContent className="space-y-2 pt-2">
                         <div className="flex items-center space-x-2">
                           <Checkbox id="ft-job" />
                           <label htmlFor="ft-job" className="text-sm text-slate-600">Internships with job offer</label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox id="fast-response" />
                           <label htmlFor="fast-response" className="text-sm text-slate-600">Fast response</label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Checkbox id="early-applicant" />
                           <label htmlFor="early-applicant" className="text-sm text-slate-600">Early applicant</label>
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                </div>
              </ScrollArea>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-4 w-full">
               <div className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center">
                  <h1 className="font-semibold text-lg">
                    {MOCK_INTERNSHIPS.length} Total Internships
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     Sort by: 
                     <select className="bg-transparent font-medium text-foreground focus:outline-none">
                       <option>Popularity</option>
                       <option>Newest First</option>
                       <option>Highest Stipend</option>
                     </select>
                  </div>
               </div>

               <div className="space-y-4">
                 {MOCK_INTERNSHIPS.map((internship) => (
                   <InternshipCard key={internship.id} internship={internship} />
                 ))}
                 {/* Duplicate for scrolling effect */}
                 {MOCK_INTERNSHIPS.map((internship) => (
                   <InternshipCard key={`dup-${internship.id}`} internship={{...internship, id: internship.id + 10}} />
                 ))}
               </div>

               <div className="flex justify-center py-8">
                 <Button variant="outline" className="w-full max-w-xs">Load More</Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
