import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateOTP, sendOTPEmail } from "./email";
import { insertOtpSchema, insertUserSchema, insertInternshipSchema, insertApplicationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============= AUTH ROUTES =============
  
  // Send OTP to email
  app.post("/api/auth/send-otp", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      // Generate 6-digit OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTPs for this email
      await storage.deleteOtpsByEmail(email);

      // Store OTP
      await storage.createOtp({
        email,
        code: otp,
        expiresAt,
      });

      // Send email
      await sendOTPEmail(email, otp);

      res.json({ 
        success: true, 
        message: "OTP sent to your email",
        // In development, return OTP for testing
        ...(process.env.NODE_ENV === "development" && { otp })
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify OTP and login/register
  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required" });
      }

      // Verify OTP
      const validOtp = await storage.getValidOtp(email, code);

      if (!validOtp) {
        return res.status(401).json({ error: "Invalid or expired OTP" });
      }

      // Delete used OTP
      await storage.deleteOtpsByEmail(email);

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);

      if (existingUser) {
        // Returning user - login
        res.json({
          success: true,
          isNewUser: false,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
          },
        });
      } else {
        // New user - needs to complete registration
        res.json({
          success: true,
          isNewUser: true,
          email,
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Complete registration (for new users after OTP verification)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, role, name } = req.body;

      if (!email || !role || !["student", "employer", "admin"].includes(role)) {
        return res.status(400).json({ error: "Valid email and role are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create new user
      const newUser = await storage.createUser({
        email,
        role,
        name: name || email.split("@")[0],
        isVerified: true,
      });

      res.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // Get current user (session check)
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      // In a real app, you'd use session middleware or JWT
      // For now, we'll use a simple user_id from query/header
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // ============= INTERNSHIP ROUTES =============

  // Get all internships
  app.get("/api/internships", async (req: Request, res: Response) => {
    try {
      const internships = await storage.getInternships();
      res.json(internships);
    } catch (error) {
      console.error("Error fetching internships:", error);
      res.status(500).json({ error: "Failed to fetch internships" });
    }
  });

  // Get internship by ID
  app.get("/api/internships/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const internship = await storage.getInternshipById(id);

      if (!internship) {
        return res.status(404).json({ error: "Internship not found" });
      }

      res.json(internship);
    } catch (error) {
      console.error("Error fetching internship:", error);
      res.status(500).json({ error: "Failed to fetch internship" });
    }
  });

  // Create internship (employer only)
  app.post("/api/internships", async (req: Request, res: Response) => {
    try {
      const data = insertInternshipSchema.parse(req.body);
      const internship = await storage.createInternship(data);
      res.json(internship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating internship:", error);
      res.status(500).json({ error: "Failed to create internship" });
    }
  });

  // Get internships by employer
  app.get("/api/internships/employer/:employerId", async (req: Request, res: Response) => {
    try {
      const employerId = parseInt(req.params.employerId);
      const internships = await storage.getInternshipsByEmployer(employerId);
      res.json(internships);
    } catch (error) {
      console.error("Error fetching employer internships:", error);
      res.status(500).json({ error: "Failed to fetch internships" });
    }
  });

  // ============= APPLICATION ROUTES =============

  // Create application (student only)
  app.post("/api/applications", async (req: Request, res: Response) => {
    try {
      const data = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(data);
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Failed to create application" });
    }
  });

  // Get applications by student
  app.get("/api/applications/student/:studentId", async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const applications = await storage.getApplicationsByStudent(studentId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching student applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Get applications by internship (employer only)
  app.get("/api/applications/internship/:internshipId", async (req: Request, res: Response) => {
    try {
      const internshipId = parseInt(req.params.internshipId);
      const applications = await storage.getApplicationsByInternship(internshipId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching internship applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Update application status (employer only)
  app.patch("/api/applications/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !["Applied", "Shortlisted", "Rejected", "Hired"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const application = await storage.updateApplicationStatus(id, status);

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  // ============= ADMIN ROUTES =============

  // Get platform stats (admin only)
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    try {
      // This is a placeholder - you'd implement proper queries
      res.json({
        totalStudents: 0,
        totalEmployers: 0,
        totalInternships: 0,
        pendingApprovals: 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
