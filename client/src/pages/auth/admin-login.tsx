import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Shield, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";

export default function AdminLogin() {
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
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isAdminLogin: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: data.otp 
          ? `Check console or use OTP: ${data.otp}` 
          : "Please check your email for the verification code.",
      });
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: otp, isAdminLogin: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      if (data.user.role !== "admin") {
        throw new Error("This login is only for administrators. Please use the regular login.");
      }

      login({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        phone: data.user.phone,
        isSuperAdmin: data.user.isSuperAdmin,
      });
      
      toast({ 
        title: `Welcome, ${data.user.name || "Admin"}!`,
        description: "You are now logged in as an administrator."
      });
      
      setLocation("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
        <p className="text-slate-400">InternConnect Administration</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-700 bg-slate-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            {step === "email" ? "Admin Login" : "Verify OTP"}
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            {step === "email" 
              ? "Enter your admin email to receive a verification code" 
              : `Enter the 6-digit code sent to ${email}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@example.com" 
                    className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-admin-email"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-send-admin-otp">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                Send Verification Code
              </Button>
              <div className="text-xs text-center text-slate-500 mt-4">
                <p>Only registered administrators can access this portal.</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-200">Verification Code</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="123456" 
                  className="text-center text-lg tracking-widest bg-slate-700 border-slate-600 text-white"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  data-testid="input-admin-otp"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-verify-admin-otp">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify & Access Dashboard
              </Button>
              <div className="text-center">
                 <Button 
                   variant="link" 
                   size="sm" 
                   onClick={() => setStep("email")} 
                   className="text-xs text-slate-400 hover:text-slate-200"
                 >
                   Change Email
                 </Button>
              </div>
            </form>
          )}
          
          <div className="mt-6 pt-4 border-t border-slate-700">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
