import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Award, 
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link as LinkIcon
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ResumeSection {
  id: string;
  title: string;
  icon: any;
  isComplete: boolean;
}

export default function StudentResume() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["personal", "education"]);
  
  const sections: ResumeSection[] = [
    { id: "personal", title: "Personal Details", icon: User, isComplete: true },
    { id: "education", title: "Education", icon: GraduationCap, isComplete: true },
    { id: "experience", title: "Work Experience", icon: Briefcase, isComplete: false },
    { id: "skills", title: "Skills", icon: Award, isComplete: true },
    { id: "projects", title: "Projects / Portfolio", icon: FolderOpen, isComplete: false },
    { id: "certifications", title: "Certifications", icon: Award, isComplete: false },
  ];

  const completedSections = sections.filter(s => s.isComplete).length;
  const profileStrength = Math.round((completedSections / sections.length) * 100);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const skills = ["JavaScript", "React", "Node.js", "Python", "HTML/CSS", "Git", "MongoDB"];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Edit Resume</h1>
            <p className="text-muted-foreground">Complete your profile to increase visibility to employers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-preview">
              <FileText className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button variant="outline" data-testid="button-download">
              <Upload className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Profile Strength</h3>
                <p className="text-sm text-muted-foreground">
                  {completedSections} of {sections.length} sections completed
                </p>
              </div>
              <span className={`text-2xl font-bold ${profileStrength >= 80 ? 'text-green-600' : profileStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {profileStrength}%
              </span>
            </div>
            <Progress value={profileStrength} className="h-2" />
            {profileStrength < 100 && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Complete all sections for better job matches
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Collapsible open={expandedSections.includes("personal")} onOpenChange={() => toggleSection("personal")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${true ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Personal Details</CardTitle>
                        <CardDescription>Basic information about you</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      {expandedSections.includes("personal") ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" defaultValue="Rahul Sharma" data-testid="input-fullname" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="rahul@example.com" data-testid="input-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue="+91 9876543210" data-testid="input-phone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Current Location</Label>
                      <Input id="location" defaultValue="Bangalore, India" data-testid="input-location" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Summary</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Write a short summary about yourself, your goals, and what you're looking for..."
                      className="min-h-[100px]"
                      defaultValue="Aspiring full-stack developer with a passion for building scalable web applications. Currently pursuing B.Tech in Computer Science with hands-on experience in React and Node.js."
                      data-testid="input-bio"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button data-testid="button-save-personal">Save Changes</Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={expandedSections.includes("education")} onOpenChange={() => toggleSection("education")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Education</CardTitle>
                        <CardDescription>Your academic background</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      {expandedSections.includes("education") ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <Separator />
                  <div className="p-4 border rounded-lg bg-slate-50/50 relative group">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                    <h4 className="font-semibold">B.Tech in Computer Science</h4>
                    <p className="text-sm text-muted-foreground">IIT Delhi</p>
                    <p className="text-xs text-muted-foreground mt-1">2021 - 2025 (Expected) | CGPA: 8.5/10</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-slate-50/50 relative group">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                    <h4 className="font-semibold">Class XII (CBSE)</h4>
                    <p className="text-sm text-muted-foreground">Delhi Public School, R.K. Puram</p>
                    <p className="text-xs text-muted-foreground mt-1">2021 | Score: 95.4%</p>
                  </div>
                  <Button variant="outline" className="w-full" data-testid="button-add-education">
                    <Plus className="w-4 h-4 mr-2" /> Add Education
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={expandedSections.includes("experience")} onOpenChange={() => toggleSection("experience")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Work Experience</CardTitle>
                        <CardDescription>Internships, jobs, and volunteer work</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      {expandedSections.includes("experience") ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <Separator />
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="mb-4">No work experience added yet</p>
                    <Button data-testid="button-add-experience">
                      <Plus className="w-4 h-4 mr-2" /> Add Experience
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={expandedSections.includes("skills")} onOpenChange={() => toggleSection("skills")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Skills</CardTitle>
                        <CardDescription>Technical and soft skills</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      {expandedSections.includes("skills") ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm group cursor-pointer hover:bg-red-100">
                        {skill}
                        <span className="ml-2 opacity-0 group-hover:opacity-100 text-red-500">×</span>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add a skill (e.g., Python, Leadership)" data-testid="input-skill" />
                    <Button data-testid="button-add-skill">Add</Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={expandedSections.includes("projects")} onOpenChange={() => toggleSection("projects")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Projects / Portfolio</CardTitle>
                        <CardDescription>Showcase your work</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      {expandedSections.includes("projects") ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <Separator />
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="mb-4">No projects added yet</p>
                    <Button data-testid="button-add-project">
                      <Plus className="w-4 h-4 mr-2" /> Add Project
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={expandedSections.includes("certifications")} onOpenChange={() => toggleSection("certifications")}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">Certifications</CardTitle>
                        <CardDescription>Online courses and certificates</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      {expandedSections.includes("certifications") ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <Separator />
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="mb-4">No certifications added yet</p>
                    <Button data-testid="button-add-certification">
                      <Plus className="w-4 h-4 mr-2" /> Add Certification
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </DashboardLayout>
  );
}
