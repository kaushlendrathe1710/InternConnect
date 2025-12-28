# InternConnect - Internship & Job Portal

## Overview

InternConnect is a full-stack web application that connects students with internship opportunities from employers. The platform features role-based access (students, employers, admins), OTP-based authentication, and a comprehensive internship management system.

**Core Purpose**: Enable students to discover and apply for internships while providing employers with tools to post opportunities and manage applications.

**Tech Stack**: 
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Express.js, Node.js
- Database: PostgreSQL (via Neon serverless)
- ORM: Drizzle
- Email: Nodemailer with SMTP support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Authentication System
**Problem**: Secure, passwordless authentication for multiple user types
**Solution**: OTP-based email authentication with role-based access control
- Generates 6-digit OTPs with 10-minute expiration
- Development mode logs OTPs to console instead of sending emails
- Production mode supports multiple SMTP providers (Gmail, SendGrid, Mailgun, etc.)
- Session-based user state managed via localStorage on client
- No traditional password system - relies entirely on email verification

**Rationale**: Passwordless authentication reduces friction for users and eliminates password management complexity. OTP expiration ensures security while development mode logging enables easy testing.

### Database Architecture
**Problem**: Store users, internships, jobs, applications, assignments, notifications, reviews and OTPs with proper relationships
**Solution**: PostgreSQL with Drizzle ORM using 11 main tables:
- `users`: Stores all user types (students, employers, admins) with role field
- `otps`: Temporary storage for one-time passwords with expiration
- `internships`: Internship postings created by employers
- `applications`: Student applications to internships
- `jobs`: Full-time job postings (separate from internships)
- `job_applications`: Student applications to jobs
- `assignments`: Tasks sent to candidates for evaluation
- `applicant_notes`: Employer notes and ratings on applicants
- `notifications`: In-app notifications with email triggers
- `company_profiles`: Employer company information
- `reviews`: Student reviews and ratings for internships, jobs, and companies

**Design Pattern**: Single table inheritance for users (role discriminator), with foreign keys linking internships/jobs to employer users and applications to both students and internships/jobs.

**Recent Additions (December 2025)**: Added jobs module, assignment system, notifications, company profiles, reviews, and internship approval workflow to achieve Internshala-level feature completeness.

### Internship Approval Workflow
**Problem**: Ensure quality control for internship postings before students see them
**Solution**: Admin approval workflow with three states: pending, approved, rejected
- When employers post internships, status defaults to "pending"
- Admins review pending internships and can approve or reject with reason
- Only approved internships are visible to students
- Employers see their internships organized by status in dashboard tabs
- Rejected internships show rejection reason to employers
- Notifications sent to employers when internships are approved/rejected

**Schema Fields**: `approvalStatus` (pending/approved/rejected), `rejectionReason`, `reviewedBy`, `reviewedAt`

**API Endpoints**:
- `POST /api/admin/internships/:id/approve` - Approve an internship
- `POST /api/admin/internships/:id/reject` - Reject with optional reason
- `GET /api/admin/internships/pending` - Get pending internships for review
- `GET /api/internships/employer/:id?status=pending|approved|rejected` - Filter by status

### Frontend Architecture
**Problem**: Multi-role interface with shared components and role-specific dashboards
**Solution**: React SPA with route-based role separation
- Shared UI components via shadcn/ui library (40+ components)
- Role-specific dashboard layouts (`DashboardLayout` component)
- Client-side routing with wouter (lightweight router)
- Global auth context provides user state across application
- TanStack Query for server state management

**Component Structure**:
- `/pages` - Route components (home, search, dashboards by role)
- `/components/layout` - Navigation and dashboard layouts
- `/components/ui` - Reusable UI primitives
- `/lib` - Utilities (auth context, API client, mock data)

**Pros**: Clear separation of concerns, reusable components, type-safe
**Cons**: Client-side routing requires all routes to be public (handled by auth checks in components)

### API Architecture
**Problem**: RESTful endpoints for authentication and data management
**Solution**: Express.js server with route handlers in single file
- `/api/auth/send-otp` - Generate and email OTP
- `/api/auth/verify-otp` - Validate OTP and return user session
- `/api/internships` - CRUD for internship postings
- `/api/jobs` - CRUD for job postings
- `/api/applications` - Internship applications management
- `/api/job-applications` - Job applications management
- `/api/assignments` - Assignment creation, submission, and review
- `/api/applicant-notes` - Employer notes and ratings
- `/api/notifications` - In-app notification system
- `/api/company-profiles` - Company profile management
- `/api/reviews` - Review and rating system

**Storage Layer**: Abstract storage interface (`IStorage`) with `DatabaseStorage` implementation (~800 lines) providing CRUD methods for all 11 tables.

**Authorization**: All protected routes use `authMiddleware` with role-based guards (employer/student/admin checks).

**Error Handling**: Structured error responses with appropriate HTTP status codes.

### Build System
**Problem**: Bundle client and server for production deployment
**Solution**: Dual build process
- Client: Vite builds React SPA to `dist/public`
- Server: esbuild bundles Express server to `dist/index.cjs`
- Allowlist strategy bundles critical dependencies (database, email) while externalizing others
- Custom Vite plugins for meta image updates and Replit integration

**Rationale**: Bundling server dependencies reduces cold start times by minimizing file system operations. Vite provides fast HMR for development.

### Development vs Production Modes
**Problem**: Different behavior needed for local development vs production
**Solution**: Environment-based configuration
- Development: OTPs logged to console, Vite dev server with HMR
- Production: Real email sending, static file serving from dist
- `NODE_ENV` determines mode, `DATABASE_URL` required in both

## External Dependencies

### Database Service
- **Neon Serverless PostgreSQL**: Primary database
- Connection via `@neondatabase/serverless` package
- Requires `DATABASE_URL` environment variable
- WebSocket-based connection using `ws` package

### Email Service (Production)
- **SMTP Providers**: Gmail, SendGrid, Mailgun, Amazon SES, Postmark
- Required environment variables:
  - `SMTP_HOST` - SMTP server hostname
  - `SMTP_PORT` - Port (587 for TLS, 465 for SSL)
  - `SMTP_USER` - Authentication username
  - `SMTP_PASS` - Authentication password/API key
- Development mode skips email and logs OTPs to console
- Configured via Nodemailer transport

### UI Component Library
- **shadcn/ui**: 40+ React components built on Radix UI primitives
- Tailwind CSS for styling with CSS variables for theming
- Lucide React for icons

### Replit Platform Integration
- Dev banner and cartographer plugins (development only)
- Runtime error overlay for better DX
- Custom meta image plugin for OpenGraph tags
- Deployment URL detection for proper asset paths

### Session Management
- Client-side: localStorage for user persistence
- Server-side: Potential for `connect-pg-simple` (PostgreSQL session store) and `express-session` packages are installed but implementation not visible in provided files

### Form Validation
- **Zod**: Runtime schema validation
- `drizzle-zod` for automatic schema generation from database tables
- React Hook Form with Zod resolver for client-side forms