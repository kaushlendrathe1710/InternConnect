-- InternConnect Production Database Migration
-- Run this SQL on your production database to create all required tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- OTPs table
CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Internships table
CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  stipend TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT NOT NULL,
  perks TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id),
  internship_id INTEGER NOT NULL REFERENCES internships(id),
  status TEXT NOT NULL DEFAULT 'Applied',
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  internship_id INTEGER REFERENCES internships(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  sender_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  salary TEXT NOT NULL,
  experience TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT NOT NULL,
  perks TEXT,
  openings INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id),
  job_id INTEGER NOT NULL REFERENCES jobs(id),
  status TEXT NOT NULL DEFAULT 'Applied',
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id),
  job_application_id INTEGER REFERENCES job_applications(id),
  employer_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'Pending',
  submission_text TEXT,
  submission_url TEXT,
  submitted_at TIMESTAMP,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applicant Notes table
CREATE TABLE IF NOT EXISTS applicant_notes (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id),
  job_application_id INTEGER REFERENCES job_applications(id),
  employer_id INTEGER NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company Profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  company_name TEXT NOT NULL,
  logo TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  founded TEXT,
  about TEXT,
  location TEXT,
  social_links TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id),
  internship_id INTEGER REFERENCES internships(id),
  job_id INTEGER REFERENCES jobs(id),
  company_profile_id INTEGER REFERENCES company_profiles(id),
  rating INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  would_recommend BOOLEAN DEFAULT TRUE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Super Admin if not exists
INSERT INTO users (email, name, role, is_verified, is_super_admin, is_suspended)
SELECT 'kaushlendra.k12@fms.edu', 'Super Admin', 'admin', TRUE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kaushlendra.k12@fms.edu');
