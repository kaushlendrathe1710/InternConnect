import { 
  users, 
  otps,
  internships,
  applications,
  type User, 
  type InsertUser,
  type Otp,
  type InsertOtp,
  type Internship,
  type InsertInternship,
  type Application,
  type InsertApplication
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
