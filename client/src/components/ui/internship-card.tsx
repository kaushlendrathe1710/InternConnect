import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Internship } from "@/lib/mockData";
import { Calendar, MapPin, Wallet, Clock, ChevronRight, Home, Building2 } from "lucide-react";
import { Link } from "wouter";

interface InternshipCardProps {
  internship: Internship;
}

export function InternshipCard({ internship }: InternshipCardProps) {
  return (
    <Card className="group relative overflow-hidden border-l-4 border-l-transparent hover:border-l-primary transition-all hover:shadow-md">
      <div className="absolute top-0 right-0 p-3">
         <div className="bg-muted/50 p-1.5 rounded border">
           <img src={internship.logo} alt={internship.company} className="w-8 h-8 rounded object-cover" />
         </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1 border px-1.5 py-0.5 rounded bg-secondary/50">
              <Building2 className="w-3 h-3" />
              Actively Hiring
            </span>
          </div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {internship.title}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {internship.company}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 text-sm text-muted-foreground mb-4">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400">
              <MapPin className="w-3 h-3" /> Location
            </span>
            <span className="font-medium text-foreground text-xs sm:text-sm truncate" title={internship.location}>
              {internship.location}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400">
              <Wallet className="w-3 h-3" /> Stipend
            </span>
            <span className="font-medium text-foreground text-xs sm:text-sm">
              {internship.stipend}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400">
              <Calendar className="w-3 h-3" /> Duration
            </span>
            <span className="font-medium text-foreground text-xs sm:text-sm">
              {internship.duration}
            </span>
          </div>

           <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400">
              <Clock className="w-3 h-3" /> Posted
            </span>
            <span className="font-medium text-green-600 text-xs sm:text-sm">
              {internship.postedAgo}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {internship.type === 'Work From Home' && (
            <Badge variant="secondary" className="font-normal text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
              <Home className="w-3 h-3 mr-1" /> Work From Home
            </Badge>
          )}
          {internship.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-normal text-xs text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center border-t bg-muted/10 px-6 py-3">
         <Button variant="ghost" size="sm" className="text-primary h-8 px-2 hover:text-primary/80 hover:bg-blue-50">
            View Details <ChevronRight className="w-4 h-4 ml-1" />
         </Button>
         <Button size="sm" className="h-8">Apply Now</Button>
      </CardFooter>
    </Card>
  );
}
