import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Building2, CheckCircle, Loader2, User, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

const countryCodes = [
  { code: "+91", country: "India", digits: 10 },
  { code: "+1", country: "USA/Canada", digits: 10 },
  { code: "+44", country: "UK", digits: 10 },
  { code: "+61", country: "Australia", digits: 9 },
  { code: "+971", country: "UAE", digits: 9 },
  { code: "+65", country: "Singapore", digits: 8 },
  { code: "+60", country: "Malaysia", digits: 9 },
  { code: "+49", country: "Germany", digits: 10 },
  { code: "+33", country: "France", digits: 9 },
  { code: "+81", country: "Japan", digits: 10 },
];

export default function RoleSelection() {
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<"student" | "employer" | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
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

  const handleRoleSelect = () => {
    if (!role) return;
    setStep("details");
  };

  const getRequiredDigits = (): number => {
    const country = countryCodes.find(c => c.code === countryCode);
    return country?.digits || 10;
  };

  const isValidPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const requiredDigits = getRequiredDigits();
    const phoneRegex = new RegExp(`^[0-9]{${requiredDigits}}$`);
    return phoneRegex.test(cleanPhone);
  };

  const handleRegister = async () => {
    if (!role || !email || !fullName || !phone) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const requiredDigits = getRequiredDigits();
    if (!isValidPhone(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: `Please enter exactly ${requiredDigits} digits for your mobile number`,
        variant: "destructive",
      });
      return;
    }
    
    const fullPhone = `${countryCode}${phone}`;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          role,
          name: fullName,
          phone: fullPhone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      login({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        phone: data.user.phone,
      });
      
      toast({
        title: "Registration Successful!",
        description: `Welcome to InternConnect, ${fullName}!`,
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

  if (step === "details") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className={`mx-auto p-3 rounded-full mb-2 ${role === "student" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
              {role === "student" ? <GraduationCap className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
            </div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              {role === "student" 
                ? "Tell us about yourself to find the best internships" 
                : "Set up your company profile to start hiring"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="fullName"
                  type="text" 
                  placeholder={role === "student" ? "Rahul Sharma" : "Company Name"}
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[140px]" data-testid="select-country-code">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} {c.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone"
                    type="tel" 
                    placeholder={`${getRequiredDigits()} digits`}
                    className="pl-9"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPhone(value);
                    }}
                    maxLength={getRequiredDigits()}
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter {getRequiredDigits()} digit mobile number
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                disabled={!fullName || !phone || isLoading}
                onClick={handleRegister}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground"
                onClick={() => setStep("role")}
              >
                Go back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            disabled={!role}
            onClick={handleRoleSelect}
          >
            Continue as {role ? (role.charAt(0).toUpperCase() + role.slice(1)) : "..."}
          </Button>
        </div>
      </div>
    </div>
  );
}
