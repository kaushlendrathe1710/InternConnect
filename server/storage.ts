import { 
  users, 
  otps,
  internships,
  applications,
  conversations,
  messages,
  SUPER_ADMIN_EMAIL,
  type User, 
  type InsertUser,
  type Otp,
  type InsertOtp,
  type Internship,
  type InsertInternship,
  type Application,
  type InsertApplication,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql, ne, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // OTP methods
  createOtp(otp: InsertOtp): Promise<Otp>;
  getValidOtp(email: string, code: string): Promise<Otp | undefined>;
  deleteOtpsByEmail(email: string): Promise<void>;
  
  // Internship methods
  createInternship(internship: InsertInternship): Promise<Internship>;
  getInternships(): Promise<Internship[]>;
  getInternshipById(id: number): Promise<Internship | undefined>;
  getInternshipsByEmployer(employerId: number): Promise<Internship[]>;
  
  // Application methods
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByStudent(studentId: number): Promise<Application[]>;
  getApplicationsByInternship(internshipId: number): Promise<Application[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  
  // Conversation methods
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByParticipants(employerId: number, studentId: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number, role: string): Promise<(Conversation & { otherUser: User | null; lastMessage: Message | null; unreadCount: number })[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserStatus(id: number, isSuspended: boolean): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  createAdmin(user: InsertUser): Promise<User>;
  getAdminStats(): Promise<{ students: number; employers: number; admins: number; internships: number; applications: number }>;
  updateInternshipStatus(id: number, isActive: boolean): Promise<Internship | undefined>;
  getAllInternships(): Promise<Internship[]>;
  getAllApplications(): Promise<Application[]>;
  ensureSuperAdmin(): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // OTP methods
  async createOtp(insertOtp: InsertOtp): Promise<Otp> {
    const [otp] = await db
      .insert(otps)
      .values(insertOtp)
      .returning();
    return otp;
  }

  async getValidOtp(email: string, code: string): Promise<Otp | undefined> {
    const [otp] = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.email, email),
          eq(otps.code, code),
          sql`${otps.expiresAt} > NOW()`
        )
      )
      .orderBy(desc(otps.createdAt))
      .limit(1);
    return otp || undefined;
  }

  async deleteOtpsByEmail(email: string): Promise<void> {
    await db.delete(otps).where(eq(otps.email, email));
  }

  // Internship methods
  async createInternship(insertInternship: InsertInternship): Promise<Internship> {
    const [internship] = await db
      .insert(internships)
      .values(insertInternship)
      .returning();
    return internship;
  }

  async getInternships(): Promise<Internship[]> {
    return await db
      .select()
      .from(internships)
      .where(eq(internships.isActive, true))
      .orderBy(desc(internships.createdAt));
  }

  async getInternshipById(id: number): Promise<Internship | undefined> {
    const [internship] = await db
      .select()
      .from(internships)
      .where(eq(internships.id, id));
    return internship || undefined;
  }

  async getInternshipsByEmployer(employerId: number): Promise<Internship[]> {
    return await db
      .select()
      .from(internships)
      .where(eq(internships.employerId, employerId))
      .orderBy(desc(internships.createdAt));
  }

  // Application methods
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getApplicationsByStudent(studentId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.studentId, studentId))
      .orderBy(desc(applications.appliedAt));
  }

  async getApplicationsByInternship(internshipId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.internshipId, internshipId))
      .orderBy(desc(applications.appliedAt));
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  // Conversation methods
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationByParticipants(employerId: number, studentId: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.employerId, employerId),
          eq(conversations.studentId, studentId)
        )
      );
    return conversation || undefined;
  }

  async getConversationsByUser(userId: number, role: string): Promise<(Conversation & { otherUser: User | null; lastMessage: Message | null; unreadCount: number })[]> {
    const userConversations = await db
      .select()
      .from(conversations)
      .where(
        role === "employer" 
          ? eq(conversations.employerId, userId)
          : eq(conversations.studentId, userId)
      )
      .orderBy(desc(conversations.updatedAt));

    const result = await Promise.all(
      userConversations.map(async (conv) => {
        const otherUserId = role === "employer" ? conv.studentId : conv.employerId;
        const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
        
        const [lastMessage] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        const unreadMessages = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              eq(messages.isRead, false),
              sql`${messages.senderId} != ${userId}`
            )
          );

        return {
          ...conv,
          otherUser: otherUser || null,
          lastMessage: lastMessage || null,
          unreadCount: unreadMessages.length,
        };
      })
    );

    return result;
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, insertMessage.conversationId));
    
    return message;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${userId}`
        )
      );
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(desc(users.createdAt));
  }

  async updateUserStatus(id: number, isSuspended: boolean): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (user?.email === SUPER_ADMIN_EMAIL) {
      throw new Error("Cannot modify super admin account");
    }

    const [updated] = await db
      .update(users)
      .set({ isSuspended })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.email === SUPER_ADMIN_EMAIL) {
      throw new Error("Cannot delete super admin account");
    }

    if (user.isSuperAdmin) {
      throw new Error("Cannot delete super admin account");
    }

    // Delete related data based on user role
    if (user.role === "employer") {
      // Get all internships by this employer
      const employerInternships = await db.select().from(internships).where(eq(internships.employerId, id));
      
      // Delete applications for each internship
      for (const internship of employerInternships) {
        await db.delete(applications).where(eq(applications.internshipId, internship.id));
      }
      
      // Delete all internships by this employer
      await db.delete(internships).where(eq(internships.employerId, id));
      
      // Delete conversations where employer is participant
      const employerConversations = await db.select().from(conversations).where(eq(conversations.employerId, id));
      for (const conv of employerConversations) {
        await db.delete(messages).where(eq(messages.conversationId, conv.id));
      }
      await db.delete(conversations).where(eq(conversations.employerId, id));
    } else if (user.role === "student") {
      // Delete all applications by this student
      await db.delete(applications).where(eq(applications.studentId, id));
      
      // Delete conversations where student is participant
      const studentConversations = await db.select().from(conversations).where(eq(conversations.studentId, id));
      for (const conv of studentConversations) {
        await db.delete(messages).where(eq(messages.conversationId, conv.id));
      }
      await db.delete(conversations).where(eq(conversations.studentId, id));
    }

    // Finally delete the user
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async createAdmin(insertUser: InsertUser): Promise<User> {
    const [admin] = await db
      .insert(users)
      .values({ ...insertUser, role: "admin" })
      .returning();
    return admin;
  }

  async getAdminStats(): Promise<{ students: number; employers: number; admins: number; internships: number; applications: number }> {
    const [studentCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "student"));
    const [employerCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "employer"));
    const [adminCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));
    const [internshipCount] = await db.select({ count: count() }).from(internships);
    const [applicationCount] = await db.select({ count: count() }).from(applications);

    return {
      students: studentCount?.count || 0,
      employers: employerCount?.count || 0,
      admins: adminCount?.count || 0,
      internships: internshipCount?.count || 0,
      applications: applicationCount?.count || 0,
    };
  }

  async updateInternshipStatus(id: number, isActive: boolean): Promise<Internship | undefined> {
    const [internship] = await db
      .update(internships)
      .set({ isActive })
      .where(eq(internships.id, id))
      .returning();
    return internship || undefined;
  }

  async getAllInternships(): Promise<Internship[]> {
    return await db
      .select()
      .from(internships)
      .orderBy(desc(internships.createdAt));
  }

  async getAllApplications(): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .orderBy(desc(applications.appliedAt));
  }

  async ensureSuperAdmin(): Promise<User> {
    let [superAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, SUPER_ADMIN_EMAIL));

    if (!superAdmin) {
      [superAdmin] = await db
        .insert(users)
        .values({
          email: SUPER_ADMIN_EMAIL,
          name: "Super Admin",
          role: "admin",
          isVerified: true,
          isSuperAdmin: true,
          isSuspended: false,
        })
        .returning();
      console.log("Super admin account created:", SUPER_ADMIN_EMAIL);
    } else if (!superAdmin.isSuperAdmin) {
      [superAdmin] = await db
        .update(users)
        .set({ isSuperAdmin: true, role: "admin" })
        .where(eq(users.email, SUPER_ADMIN_EMAIL))
        .returning();
      console.log("Super admin flag updated for:", SUPER_ADMIN_EMAIL);
    }

    return superAdmin;
  }
}

export const storage = new DatabaseStorage();
