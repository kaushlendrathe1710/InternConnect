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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const formSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  type: z.enum(["in-office", "remote", "hybrid"]),
  location: z.string().min(2, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  stipendType: z.enum(["fixed", "negotiable", "unpaid"]),
  stipendAmount: z.string().optional(),
  skills: z.string().min(3, "At least one skill is required"),
  description: z.string().min(50, "Please provide a detailed description (min 50 chars)"),
  perks: z.string().optional(),
});

export default function PostInternship() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "in-office",
      location: "",
      duration: "3 Months",
      stipendType: "fixed",
      stipendAmount: "",
      skills: "",
      description: "",
      perks: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Internship Posted Successfully!",
      description: "Your listing is now live and visible to students.",
    });
    // Simulate redirect
    setTimeout(() => setLocation("/employer/dashboard"), 1500);
  }

  return (
    <DashboardLayout role="employer">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Post a new opportunity</h1>
          <p className="text-muted-foreground">Fill in the details to find the best talent for your team.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Internship Details</CardTitle>
            <CardDescription>Provide clear information to attract the right candidates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internship Profile / Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Full Stack Web Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Internship Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="in-office" />
                              </FormControl>
                              <FormLabel className="font-normal">In-office</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="remote" />
                              </FormControl>
                              <FormLabel className="font-normal">Work from home (Remote)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="hybrid" />
                              </FormControl>
                              <FormLabel className="font-normal">Hybrid</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City / Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Bangalore" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1 Month">1 Month</SelectItem>
                              <SelectItem value="2 Months">2 Months</SelectItem>
                              <SelectItem value="3 Months">3 Months</SelectItem>
                              <SelectItem value="6 Months">6 Months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                      control={form.control}
                      name="stipendType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stipend</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="negotiable">Negotiable</SelectItem>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stipendAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹ / month)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 10000" {...field} disabled={form.watch("stipendType") === "unpaid"} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Skills</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Java, Python, Communication (comma separated)" {...field} />
                      </FormControl>
                      <FormDescription>Enter skills separated by commas.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internship Description & Responsibilities</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the day-to-day responsibilities and what the intern will learn..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline">Save Draft</Button>
                  <Button type="submit" size="lg" className="px-8">Post Internship</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
