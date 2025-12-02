import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { generateOTP, sendOTPEmail } from "./email";
import { insertOtpSchema, insertUserSchema, insertInternshipSchema, insertApplicationSchema, insertMessageSchema, insertConversationSchema, SUPER_ADMIN_EMAIL } from "@shared/schema";
import { z } from "zod";

// Store active WebSocket connections by user ID
const userConnections = new Map<number, WebSocket>();

// Extended Request interface with session user
interface AuthenticatedRequest extends Request {
  sessionUser?: {
    id: number;
    email: string;
    role: string;
    isSuperAdmin: boolean;
  };
}

// Session-based authentication middleware
async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Authentication required. Please login." });
    }

    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "User not found. Please login again." });
    }

    if (user.isSuspended) {
      req.session.destroy(() => {});
      return res.status(403).json({ error: "Account suspended" });
    }

    req.sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin || false,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

// Admin authorization middleware
async function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.sessionUser || req.sessionUser.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Super admin authorization middleware
async function superAdminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.sessionUser || !req.sessionUser.isSuperAdmin) {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Initialize super admin on server start
  try {
    await storage.ensureSuperAdmin();
    console.log("Super admin initialized");
  } catch (error) {
    console.error("Failed to initialize super admin:", error);
  }
  
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
        message: "OTP sent to your email"
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify OTP and login/register
  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { email, code, isAdminLogin } = req.body;

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
        // Check if user is suspended
        if (existingUser.isSuspended) {
          return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
        }
        
        // If this is an admin login attempt, verify user is an admin
        if (isAdminLogin && existingUser.role !== "admin") {
          return res.status(403).json({ 
            error: "Access denied. This login is only for administrators. Please use the regular login." 
          });
        }
        
        // Set session
        req.session.userId = existingUser.id;
        req.session.email = existingUser.email;
        req.session.role = existingUser.role;
        req.session.isSuperAdmin = existingUser.isSuperAdmin || false;
        
        // Returning user - login
        res.json({
          success: true,
          isNewUser: false,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            phone: existingUser.phone,
            role: existingUser.role,
            isSuperAdmin: existingUser.isSuperAdmin || false,
          },
        });
      } else {
        // For admin login, don't allow new registrations
        if (isAdminLogin) {
          return res.status(403).json({ 
            error: "No admin account found with this email. Admin accounts can only be created by the super admin." 
          });
        }
        
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
      const { email, role, name, phone } = req.body;

      if (!email || !role || !["student", "employer"].includes(role)) {
        return res.status(400).json({ error: "Valid email and role are required. Admin accounts can only be created by super admin." });
      }

      if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone are required" });
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
        name,
        phone,
        isVerified: true,
      });

      // Set session for new user
      req.session.userId = newUser.id;
      req.session.email = newUser.email;
      req.session.role = newUser.role;
      req.session.isSuperAdmin = false;

      res.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // Get current user from session
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);

      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: "User not found" });
      }

      if (user.isSuspended) {
        req.session.destroy(() => {});
        return res.status(403).json({ error: "Account suspended" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || false,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Logout - destroy session
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
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

  // ============= MESSAGING ROUTES =============

  // Get or create conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { employerId, studentId, internshipId } = req.body;

      if (!employerId || !studentId) {
        return res.status(400).json({ error: "Employer ID and Student ID are required" });
      }

      // Check if conversation already exists
      let conversation = await storage.getConversationByParticipants(employerId, studentId);

      if (!conversation) {
        // Create new conversation
        conversation = await storage.createConversation({
          employerId,
          studentId,
          internshipId: internshipId || null,
        });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Get conversations for a user
  app.get("/api/conversations/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const role = req.query.role as string;

      if (!role || !["employer", "student"].includes(role)) {
        return res.status(400).json({ error: "Valid role is required" });
      }

      const conversations = await storage.getConversationsByUser(userId, role);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { senderId, content } = req.body;

      if (!senderId || !content) {
        return res.status(400).json({ error: "Sender ID and content are required" });
      }

      const message = await storage.createMessage({
        conversationId,
        senderId,
        content,
        isRead: false,
      });

      // Get conversation to find recipient
      const conversation = await storage.getConversation(conversationId);
      if (conversation) {
        const recipientId = conversation.employerId === senderId 
          ? conversation.studentId 
          : conversation.employerId;
        
        // Send real-time notification via WebSocket
        const recipientSocket = userConnections.get(recipientId);
        if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
          recipientSocket.send(JSON.stringify({
            type: "new_message",
            conversationId,
            message,
          }));
        }
      }

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Mark messages as read
  app.post("/api/conversations/:conversationId/read", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      await storage.markMessagesAsRead(conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  // ============= ADMIN ROUTES =============

  // Get platform stats (admin only)
  app.get("/api/admin/stats", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const role = req.query.role as string | undefined;
      const users = role ? await storage.getUsersByRole(role) : await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Suspend/unsuspend user (admin only)
  app.post("/api/admin/users/:id/suspend", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { isSuspended } = req.body;

      // Additional check: only super admin can suspend other admins
      const targetUser = await storage.getUser(userId);
      if (targetUser?.role === "admin" && !req.sessionUser?.isSuperAdmin) {
        return res.status(403).json({ error: "Only super admin can suspend other admins" });
      }

      const user = await storage.updateUserStatus(userId, isSuspended);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      console.error("Error updating user status:", error);
      res.status(400).json({ error: error.message || "Failed to update user status" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Additional check: only super admin can delete admins
      const targetUser = await storage.getUser(userId);
      if (targetUser?.role === "admin" && !req.sessionUser?.isSuperAdmin) {
        return res.status(403).json({ error: "Only super admin can delete admin accounts" });
      }

      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(400).json({ error: error.message || "Failed to delete user" });
    }
  });

  // Create admin account (super admin only)
  app.post("/api/admin/create-admin", authMiddleware as any, superAdminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, name, phone } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      const newAdmin = await storage.createAdmin({
        email,
        name,
        phone: phone || "",
        role: "admin",
        isVerified: true,
        isSuperAdmin: false,
        isSuspended: false,
      });

      res.json(newAdmin);
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ error: "Failed to create admin" });
    }
  });

  // Get all internships for moderation (admin only)
  app.get("/api/admin/internships", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const internships = await storage.getAllInternships();
      res.json(internships);
    } catch (error) {
      console.error("Error fetching internships:", error);
      res.status(500).json({ error: "Failed to fetch internships" });
    }
  });

  // Update internship status (admin only)
  app.post("/api/admin/internships/:id/status", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const internshipId = parseInt(req.params.id);
      const { isActive } = req.body;

      const internship = await storage.updateInternshipStatus(internshipId, isActive);
      if (!internship) {
        return res.status(404).json({ error: "Internship not found" });
      }
      res.json(internship);
    } catch (error) {
      console.error("Error updating internship status:", error);
      res.status(500).json({ error: "Failed to update internship status" });
    }
  });

  // Get all applications (admin only)
  app.get("/api/admin/applications", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // ============= ADMIN MESSAGES MODERATION =============

  // Get all conversations (admin only)
  app.get("/api/admin/conversations", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get conversation with messages (admin only)
  app.get("/api/admin/conversations/:id", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      const data = await storage.getConversationWithMessages(conversationId);
      if (!data) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Delete a message (admin only)
  app.delete("/api/admin/messages/:id", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ error: "Invalid message ID" });
      }
      const deleted = await storage.deleteMessage(messageId);
      if (!deleted) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Delete a conversation (admin only)
  app.delete("/api/admin/conversations/:id", authMiddleware as any, adminMiddleware as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      const deleted = await storage.deleteConversation(conversationId);
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // ============= WEBSOCKET SETUP =============
  
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === "register") {
          // Register this connection with user ID
          const userId = message.userId;
          if (userId) {
            userConnections.set(userId, ws);
            console.log(`User ${userId} connected via WebSocket`);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      // Remove connection from map
      const entries = Array.from(userConnections.entries());
      for (const [userId, socket] of entries) {
        if (socket === ws) {
          userConnections.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return httpServer;
}
