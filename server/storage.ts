import { 
  users, 
  otps,
  internships,
  applications,
  conversations,
  messages,
  jobs,
  jobApplications,
  assignments,
  applicantNotes,
  notifications,
  companyProfiles,
  reviews,
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
  type InsertMessage,
  type Job,
  type InsertJob,
  type JobApplication,
  type InsertJobApplication,
  type Assignment,
  type InsertAssignment,
  type ApplicantNote,
  type InsertApplicantNote,
  type Notification,
  type InsertNotification,
  type CompanyProfile,
  type InsertCompanyProfile,
  type Review,
  type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql, ne, count, asc } from "drizzle-orm";

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
  getInternships(): Promise<Internship[]>; // For students - only approved
  getApprovedInternships(): Promise<Internship[]>; // Only approved and active
  getInternshipById(id: number): Promise<Internship | undefined>;
  getInternshipsByEmployer(employerId: number, approvalStatus?: string): Promise<Internship[]>;
  getInternshipsByApprovalStatus(status: string): Promise<Internship[]>;
  reviewInternship(id: number, approvalStatus: string, reviewedBy: number, rejectionReason?: string): Promise<Internship | undefined>;
  
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
  getAdminStats(): Promise<{ students: number; employers: number; admins: number; internships: number; applications: number; conversations: number; messages: number }>;
  updateInternshipStatus(id: number, isActive: boolean): Promise<Internship | undefined>;
  getAllInternships(): Promise<Internship[]>;
  getAllApplications(): Promise<Application[]>;
  ensureSuperAdmin(): Promise<User>;
  
  // Admin messages moderation methods
  getAllConversations(): Promise<(Conversation & { employer: User | null; student: User | null; messageCount: number; lastMessageAt: Date | null })[]>;
  getConversationWithMessages(conversationId: number): Promise<{ conversation: Conversation; messages: (Message & { sender: User | null })[]; employer: User | null; student: User | null } | null>;
  deleteMessage(messageId: number): Promise<boolean>;
  deleteConversation(conversationId: number): Promise<boolean>;

  // Job methods
  createJob(job: InsertJob): Promise<Job>;
  getJobs(): Promise<Job[]>;
  getJobById(id: number): Promise<Job | undefined>;
  getJobsByEmployer(employerId: number): Promise<Job[]>;
  updateJobStatus(id: number, isActive: boolean): Promise<Job | undefined>;

  // Job Application methods
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplicationsByStudent(studentId: number): Promise<JobApplication[]>;
  getJobApplicationsByJob(jobId: number): Promise<JobApplication[]>;
  updateJobApplicationStatus(id: number, status: string): Promise<JobApplication | undefined>;

  // Assignment methods
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  getAssignmentsByEmployer(employerId: number): Promise<Assignment[]>;
  getAssignmentsByStudent(studentId: number): Promise<Assignment[]>;
  submitAssignment(id: number, submissionText: string, submissionUrl?: string): Promise<Assignment | undefined>;
  updateAssignmentStatus(id: number, status: string, feedback?: string): Promise<Assignment | undefined>;

  // Applicant Notes methods
  createApplicantNote(note: InsertApplicantNote): Promise<ApplicantNote>;
  getApplicantNote(applicationId: number, employerId: number): Promise<ApplicantNote | undefined>;
  updateApplicantNote(id: number, note: string, rating?: number): Promise<ApplicantNote | undefined>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;
  getUnreadNotificationCount(userId: number): Promise<number>;

  // Company Profile methods
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  getCompanyProfile(employerId: number): Promise<CompanyProfile | undefined>;
  getCompanyProfileById(id: number): Promise<CompanyProfile | undefined>;
  updateCompanyProfile(employerId: number, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile | undefined>;

  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByCompany(companyProfileId: number): Promise<Review[]>;
  getReviewsByInternship(internshipId: number): Promise<Review[]>;
  getReviewsByJob(jobId: number): Promise<Review[]>;
  getAverageRating(companyProfileId: number): Promise<number>;
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
      .where(and(
        eq(internships.isActive, true),
        eq(internships.approvalStatus, "approved")
      ))
      .orderBy(desc(internships.createdAt));
  }

  async getApprovedInternships(): Promise<Internship[]> {
    return await db
      .select()
      .from(internships)
      .where(and(
        eq(internships.isActive, true),
        eq(internships.approvalStatus, "approved")
      ))
      .orderBy(desc(internships.createdAt));
  }

  async getInternshipById(id: number): Promise<Internship | undefined> {
    const [internship] = await db
      .select()
      .from(internships)
      .where(eq(internships.id, id));
    return internship || undefined;
  }

  async getInternshipsByEmployer(employerId: number, approvalStatus?: string): Promise<Internship[]> {
    if (approvalStatus) {
      return await db
        .select()
        .from(internships)
        .where(and(
          eq(internships.employerId, employerId),
          eq(internships.approvalStatus, approvalStatus)
        ))
        .orderBy(desc(internships.createdAt));
    }
    return await db
      .select()
      .from(internships)
      .where(eq(internships.employerId, employerId))
      .orderBy(desc(internships.createdAt));
  }

  async getInternshipsByApprovalStatus(status: string): Promise<Internship[]> {
    return await db
      .select()
      .from(internships)
      .where(eq(internships.approvalStatus, status))
      .orderBy(desc(internships.createdAt));
  }

  async reviewInternship(id: number, approvalStatus: string, reviewedBy: number, rejectionReason?: string): Promise<Internship | undefined> {
    const updateData: any = {
      approvalStatus,
      reviewedBy,
      reviewedAt: new Date(),
    };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    if (approvalStatus === "rejected") {
      updateData.isActive = false;
    }
    const [internship] = await db
      .update(internships)
      .set(updateData)
      .where(eq(internships.id, id))
      .returning();
    return internship || undefined;
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

    // Delete related records based on user role
    if (user.role === "employer") {
      // Get all internships by this employer
      const employerInternships = await db.select().from(internships).where(eq(internships.employerId, id));
      
      // Delete all applications for these internships
      for (const internship of employerInternships) {
        await db.delete(applications).where(eq(applications.internshipId, internship.id));
      }
      
      // Delete all internships by this employer
      await db.delete(internships).where(eq(internships.employerId, id));
    } else if (user.role === "student") {
      // Delete all applications by this student
      await db.delete(applications).where(eq(applications.studentId, id));
    }
    
    // Delete any OTPs for this user
    await db.delete(otps).where(eq(otps.email, user.email));

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

  async getAdminStats(): Promise<{ students: number; employers: number; admins: number; internships: number; applications: number; conversations: number; messages: number }> {
    const [studentCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "student"));
    const [employerCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "employer"));
    const [adminCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));
    const [internshipCount] = await db.select({ count: count() }).from(internships);
    const [applicationCount] = await db.select({ count: count() }).from(applications);
    const [conversationCount] = await db.select({ count: count() }).from(conversations);
    const [messageCount] = await db.select({ count: count() }).from(messages);

    return {
      students: studentCount?.count || 0,
      employers: employerCount?.count || 0,
      admins: adminCount?.count || 0,
      internships: internshipCount?.count || 0,
      applications: applicationCount?.count || 0,
      conversations: conversationCount?.count || 0,
      messages: messageCount?.count || 0,
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

  // Admin messages moderation methods
  async getAllConversations(): Promise<(Conversation & { employer: User | null; student: User | null; messageCount: number; lastMessageAt: Date | null })[]> {
    const allConversations = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));

    const result = await Promise.all(
      allConversations.map(async (conv) => {
        const [employer] = await db.select().from(users).where(eq(users.id, conv.employerId));
        const [student] = await db.select().from(users).where(eq(users.id, conv.studentId));
        const [msgCount] = await db.select({ count: count() }).from(messages).where(eq(messages.conversationId, conv.id));
        const [lastMsg] = await db.select().from(messages).where(eq(messages.conversationId, conv.id)).orderBy(desc(messages.createdAt)).limit(1);

        return {
          ...conv,
          employer: employer || null,
          student: student || null,
          messageCount: msgCount?.count || 0,
          lastMessageAt: lastMsg?.createdAt || null,
        };
      })
    );

    return result;
  }

  async getConversationWithMessages(conversationId: number): Promise<{ conversation: Conversation; messages: (Message & { sender: User | null })[]; employer: User | null; student: User | null } | null> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    
    if (!conversation) return null;

    const [employer] = await db.select().from(users).where(eq(users.id, conversation.employerId));
    const [student] = await db.select().from(users).where(eq(users.id, conversation.studentId));
    
    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    const messagesWithSenders = await Promise.all(
      allMessages.map(async (msg) => {
        const [sender] = await db.select().from(users).where(eq(users.id, msg.senderId));
        return { ...msg, sender: sender || null };
      })
    );

    return {
      conversation,
      messages: messagesWithSenders,
      employer: employer || null,
      student: student || null,
    };
  }

  async deleteMessage(messageId: number): Promise<boolean> {
    const [message] = await db.select().from(messages).where(eq(messages.id, messageId));
    if (!message) return false;
    
    await db.delete(messages).where(eq(messages.id, messageId));
    
    // Update conversation's updatedAt timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return true;
  }

  async deleteConversation(conversationId: number): Promise<boolean> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    if (!conversation) return false;
    
    // First delete all messages in the conversation
    await db.delete(messages).where(eq(messages.conversationId, conversationId));
    // Then delete the conversation
    await db.delete(conversations).where(eq(conversations.id, conversationId));
    return true;
  }

  // Job methods
  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.isActive, true)).orderBy(desc(jobs.createdAt));
  }

  async getJobById(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async getJobsByEmployer(employerId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.employerId, employerId)).orderBy(desc(jobs.createdAt));
  }

  async updateJobStatus(id: number, isActive: boolean): Promise<Job | undefined> {
    const [job] = await db.update(jobs).set({ isActive }).where(eq(jobs.id, id)).returning();
    return job || undefined;
  }

  // Job Application methods
  async createJobApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const [application] = await db.insert(jobApplications).values(insertApplication).returning();
    return application;
  }

  async getJobApplicationsByStudent(studentId: number): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.studentId, studentId)).orderBy(desc(jobApplications.appliedAt));
  }

  async getJobApplicationsByJob(jobId: number): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId)).orderBy(desc(jobApplications.appliedAt));
  }

  async updateJobApplicationStatus(id: number, status: string): Promise<JobApplication | undefined> {
    const [application] = await db.update(jobApplications).set({ status }).where(eq(jobApplications.id, id)).returning();
    return application || undefined;
  }

  // Assignment methods
  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db.insert(assignments).values(insertAssignment).returning();
    return assignment;
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment || undefined;
  }

  async getAssignmentsByEmployer(employerId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.employerId, employerId)).orderBy(desc(assignments.createdAt));
  }

  async getAssignmentsByStudent(studentId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.studentId, studentId)).orderBy(desc(assignments.createdAt));
  }

  async submitAssignment(id: number, submissionText: string, submissionUrl?: string): Promise<Assignment | undefined> {
    const [assignment] = await db
      .update(assignments)
      .set({ 
        submissionText, 
        submissionUrl: submissionUrl || null, 
        status: "Submitted", 
        submittedAt: new Date() 
      })
      .where(eq(assignments.id, id))
      .returning();
    return assignment || undefined;
  }

  async updateAssignmentStatus(id: number, status: string, feedback?: string): Promise<Assignment | undefined> {
    const [assignment] = await db
      .update(assignments)
      .set({ status, feedback: feedback || null })
      .where(eq(assignments.id, id))
      .returning();
    return assignment || undefined;
  }

  // Applicant Notes methods
  async createApplicantNote(insertNote: InsertApplicantNote): Promise<ApplicantNote> {
    const [note] = await db.insert(applicantNotes).values(insertNote).returning();
    return note;
  }

  async getApplicantNote(applicationId: number, employerId: number): Promise<ApplicantNote | undefined> {
    const [note] = await db
      .select()
      .from(applicantNotes)
      .where(and(eq(applicantNotes.applicationId, applicationId), eq(applicantNotes.employerId, employerId)));
    return note || undefined;
  }

  async updateApplicantNote(id: number, note: string, rating?: number): Promise<ApplicantNote | undefined> {
    const [updated] = await db
      .update(applicantNotes)
      .set({ note, rating: rating || null, updatedAt: new Date() })
      .where(eq(applicantNotes.id, id))
      .returning();
    return updated || undefined;
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const [result] = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result?.count || 0;
  }

  // Company Profile methods
  async createCompanyProfile(insertProfile: InsertCompanyProfile): Promise<CompanyProfile> {
    const [profile] = await db.insert(companyProfiles).values(insertProfile).returning();
    return profile;
  }

  async getCompanyProfile(employerId: number): Promise<CompanyProfile | undefined> {
    const [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.employerId, employerId));
    return profile || undefined;
  }

  async getCompanyProfileById(id: number): Promise<CompanyProfile | undefined> {
    const [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, id));
    return profile || undefined;
  }

  async updateCompanyProfile(employerId: number, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile | undefined> {
    const [updated] = await db
      .update(companyProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(companyProfiles.employerId, employerId))
      .returning();
    return updated || undefined;
  }

  // Review methods
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getReviewsByCompany(companyProfileId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.companyProfileId, companyProfileId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByInternship(internshipId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.internshipId, internshipId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByJob(jobId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.jobId, jobId)).orderBy(desc(reviews.createdAt));
  }

  async getAverageRating(companyProfileId: number): Promise<number> {
    const reviewsList = await db.select().from(reviews).where(eq(reviews.companyProfileId, companyProfileId));
    if (reviewsList.length === 0) return 0;
    const total = reviewsList.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / reviewsList.length) * 10) / 10;
  }
}

export const storage = new DatabaseStorage();
