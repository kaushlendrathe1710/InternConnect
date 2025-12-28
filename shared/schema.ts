import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - stores all users (students, employers, admins)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  role: text("role").notNull(), // "student" | "employer" | "admin"
  isVerified: boolean("is_verified").default(false),
  isSuperAdmin: boolean("is_super_admin").default(false),
  isSuspended: boolean("is_suspended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Super admin email constant - this account cannot be deleted
export const SUPER_ADMIN_EMAIL = "kaushlendra.k12@fms.edu";

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// OTP table - stores one-time passwords for email verification
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOtpSchema = createInsertSchema(otps).omit({
  id: true,
  createdAt: true,
});

export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type Otp = typeof otps.$inferSelect;

// Internships table
export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // "Work From Home" | "In-Office" | "Hybrid"
  stipend: text("stipend").notNull(),
  duration: text("duration").notNull(),
  description: text("description").notNull(),
  skills: text("skills").notNull(), // comma-separated
  perks: text("perks"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInternshipSchema = createInsertSchema(internships).omit({
  id: true,
  createdAt: true,
});

export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type Internship = typeof internships.$inferSelect;

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  internshipId: integer("internship_id").notNull().references(() => internships.id),
  status: text("status").notNull().default("Applied"), // "Applied" | "Shortlisted" | "Rejected" | "Hired"
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Conversations table - for messaging between employers and students
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  internshipId: integer("internship_id").references(() => internships.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table - individual messages within a conversation
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Jobs table - full-time positions (separate from internships)
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // "Work From Home" | "In-Office" | "Hybrid"
  salary: text("salary").notNull(),
  experience: text("experience").notNull(), // "Fresher" | "1-2 years" | "3-5 years" | "5+ years"
  description: text("description").notNull(),
  skills: text("skills").notNull(),
  perks: text("perks"),
  openings: integer("openings").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Job Applications table
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  status: text("status").notNull().default("Applied"), // "Applied" | "Shortlisted" | "Rejected" | "Hired"
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

// Assignments table - tasks sent to shortlisted candidates
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id),
  jobApplicationId: integer("job_application_id").references(() => jobApplications.id),
  employerId: integer("employer_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  deadline: timestamp("deadline"),
  status: text("status").notNull().default("Pending"), // "Pending" | "Submitted" | "Reviewed" | "Accepted" | "Rejected"
  submissionText: text("submission_text"),
  submissionUrl: text("submission_url"),
  submittedAt: timestamp("submitted_at"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  submittedAt: true,
});

export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;

// Applicant Notes table - employer notes on applicants
export const applicantNotes = pgTable("applicant_notes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id),
  jobApplicationId: integer("job_application_id").references(() => jobApplications.id),
  employerId: integer("employer_id").notNull().references(() => users.id),
  note: text("note").notNull(),
  rating: integer("rating"), // 1-5 star rating
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApplicantNoteSchema = createInsertSchema(applicantNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApplicantNote = z.infer<typeof insertApplicantNoteSchema>;
export type ApplicantNote = typeof applicantNotes.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "application" | "shortlist" | "message" | "assignment" | "status_change"
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Company Profiles table
export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => users.id).unique(),
  companyName: text("company_name").notNull(),
  logo: text("logo"),
  website: text("website"),
  industry: text("industry"),
  size: text("size"), // "1-10" | "11-50" | "51-200" | "201-500" | "500+"
  founded: text("founded"),
  about: text("about"),
  location: text("location"),
  socialLinks: text("social_links"), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type CompanyProfile = typeof companyProfiles.$inferSelect;

// Reviews table - student reviews of internships/jobs
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  internshipId: integer("internship_id").references(() => internships.id),
  jobId: integer("job_id").references(() => jobs.id),
  companyProfileId: integer("company_profile_id").references(() => companyProfiles.id),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  content: text("content"),
  wouldRecommend: boolean("would_recommend").default(true),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
