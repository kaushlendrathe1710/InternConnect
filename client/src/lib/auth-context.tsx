import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

type UserRole = "student" | "employer" | "admin" | null;

interface User {
  id: number;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "internconnect_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Load user from localStorage and verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          // Verify the session is still valid on the server
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          });
          
          if (response.ok) {
            const serverUser = await response.json();
            setUser(serverUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverUser));
          } else {
            // Session expired or invalid - clear local storage
            console.log("Session expired, logging out");
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifySession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    
    // Redirect based on role
    if (userData.role === "student") setLocation("/student/dashboard");
    else if (userData.role === "employer") setLocation("/employer/dashboard");
    else if (userData.role === "admin") setLocation("/admin/dashboard");
    else setLocation("/");
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
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

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}
