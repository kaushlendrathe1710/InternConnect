import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function RoleSelection() {
  const [role, setRole] = useState<"student" | "employer" | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const pending = localStorage.getItem("pending_email");
    if (!pending) {
      setLocation("/auth");
    } else {
      setEmail(pending);
    }
  }, [setLocation]);

  const handleContinue = async () => {
    if (!role || !email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          role,
          name: email.split("@")[0]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      login(data.user.email, data.user.role);
      
      toast({
        title: "Registration Successful!",
        description: `Welcome to InternConnect, ${role === 'student' ? 'Student' : 'Partner'}!`,
      });
      
      localStorage.removeItem("pending_email");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">One last step!</h1>
          <p className="text-muted-foreground text-lg">Tell us how you want to use InternConnect</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 hover:border-primary/50 relative ${role === "student" ? "border-primary ring-2 ring-primary/20 bg-blue-50/30" : "border-transparent"}`}
            onClick={() => setRole("student")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full ${role === "student" ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">I'm a Student</h3>
                <p className="text-muted-foreground">I'm looking for internships, jobs, and courses to build my career.</p>
              </div>
              {role === "student" && <CheckCircle className="absolute top-4 right-4 text-primary w-6 h-6" />}
            </CardContent>
          </Card>

          {/* Employer Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 hover:border-primary/50 relative ${role === "employer" ? "border-primary ring-2 ring-primary/20 bg-blue-50/30" : "border-transparent"}`}
            onClick={() => setRole("employer")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full ${role === "employer" ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">I'm an Employer</h3>
                <p className="text-muted-foreground">I want to hire top talent and manage applications.</p>
              </div>
              {role === "employer" && <CheckCircle className="absolute top-4 right-4 text-primary w-6 h-6" />}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="w-full max-w-xs text-lg h-12"
            disabled={!role || isLoading}
            onClick={handleContinue}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              `Continue as ${role ? (role.charAt(0).toUpperCase() + role.slice(1)) : "..."}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
