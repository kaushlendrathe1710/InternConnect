import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: "Please check your email for the verification code.",
      });
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    // Simulate API verification
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock Logic for Returning vs New Users
      // admin@demo.com -> Admin
      // student@demo.com -> Returning Student
      // employer@demo.com -> Returning Employer
      // Others -> New User (Go to Role Selection)

      if (email === "admin@demo.com") {
        login(email, "admin");
        toast({ title: "Welcome Admin" });
      } else if (email === "student@demo.com") {
        login(email, "student");
        toast({ title: "Welcome back, Student!" });
      } else if (email === "employer@demo.com") {
        login(email, "employer");
        toast({ title: "Welcome back, Partner!" });
      } else {
        // New User -> Redirect to Role Selection
        // We pass the email in state or url, for now just redirect
        localStorage.setItem("pending_email", email);
        setLocation("/auth/onboarding");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">InternConnect</h1>
        <p className="text-muted-foreground">Your gateway to dream careers</p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === "email" ? "Login / Register" : "Verify OTP"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "email" 
              ? "Enter your email to receive a one-time password" 
              : `Enter the 6-digit code sent to ${email}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send OTP
              </Button>
              <div className="text-xs text-center text-muted-foreground mt-4">
                <p>Try these demo emails:</p>
                <p>student@demo.com (Returning)</p>
                <p>employer@demo.com (Returning)</p>
                <p>any@other.com (New User)</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="123456" 
                  className="text-center text-lg tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify & Login
              </Button>
              <div className="text-center">
                 <Button variant="link" size="sm" onClick={() => setStep("email")} className="text-xs text-muted-foreground">
                   Change Email
                 </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
