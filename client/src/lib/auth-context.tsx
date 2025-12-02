import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

type UserRole = "student" | "employer" | "admin" | null;

interface User {
  email: string;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check local storage for persisting mock session
    const storedUser = localStorage.getItem("mock_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: UserRole) => {
    const newUser = { email, role, name: email.split("@")[0] };
    setUser(newUser);
    localStorage.setItem("mock_user", JSON.stringify(newUser));
    
    // Redirect based on role
    if (role === "student") setLocation("/student/dashboard");
    else if (role === "employer") setLocation("/employer/dashboard");
    else if (role === "admin") setLocation("/admin/dashboard");
    else setLocation("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mock_user");
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
