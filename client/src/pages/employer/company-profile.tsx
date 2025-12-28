import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Building, Globe, MapPin, Users, Calendar, Loader2 } from "lucide-react";
import type { CompanyProfile } from "@shared/schema";

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  companyName: z.string()
    .min(2, "Company name is required")
    .regex(/^[a-zA-Z][a-zA-Z\s\-\.&']+$/, "Company name must start with a letter and contain only letters, spaces, and basic punctuation"),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.string().optional(),
  founded: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      const year = parseInt(val);
      return !isNaN(year) && year >= 1800 && year <= currentYear && /^\d{4}$/.test(val);
    }, `Founded year must be a 4-digit year between 1800 and ${currentYear}`),
  about: z.string().optional(),
  location: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      return /^[a-zA-Z][a-zA-Z\s\-,\.]+$/.test(val);
    }, "Location must contain only letters, spaces, and basic punctuation"),
  socialLinks: z.string().optional(),
});

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<CompanyProfile | null>({
    queryKey: ["/api/employer/company-profile"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: profile ? {
      companyName: profile.companyName || "",
      website: profile.website || "",
      industry: profile.industry || "",
      size: profile.size || "",
      founded: profile.founded || "",
      about: profile.about || "",
      location: profile.location || "",
      socialLinks: profile.socialLinks || "",
    } : {
      companyName: "",
      website: "",
      industry: "",
      size: "",
      founded: "",
      about: "",
      location: "",
      socialLinks: "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/employer/company-profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Saved",
        description: "Your company profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/company-profile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    saveMutation.mutate(values);
  }

  if (isLoading) {
    return (
      <DashboardLayout role="employer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employer">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="page-title">Company Profile</h1>
          <p className="text-muted-foreground">Showcase your company to attract the best talent</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>This information will be visible to candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. TechCorp India Pvt Ltd" {...field} data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-industry">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-size">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="500+">500+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="founded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded Year</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2015" {...field} data-testid="input-founded" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headquarters Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Bangalore, India" {...field} data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.example.com" {...field} data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Company</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell candidates about your company, culture, mission, and values..."
                          className="min-h-[150px]"
                          {...field}
                          data-testid="input-about"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media Links (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="LinkedIn, Twitter, etc. (one per line)"
                          className="min-h-[80px]"
                          {...field}
                          data-testid="input-social"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save">
                    {saveMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
