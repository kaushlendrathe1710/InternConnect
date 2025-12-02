import { storage } from "./storage";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create admin user
    const admin = await storage.getUserByEmail("admin@internconnect.com");
    if (!admin) {
      await storage.createUser({
        email: "admin@internconnect.com",
        name: "Platform Admin",
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Admin user created: admin@internconnect.com");
    }

    // Create sample employer
    const employer = await storage.getUserByEmail("employer@demo.com");
    let employerId: number;
    if (!employer) {
      const newEmployer = await storage.createUser({
        email: "employer@demo.com",
        name: "TechNova Solutions",
        role: "employer",
        isVerified: true,
      });
      employerId = newEmployer.id;
      console.log("✅ Sample employer created: employer@demo.com");
    } else {
      employerId = employer.id;
    }

    // Create sample student
    const student = await storage.getUserByEmail("student@demo.com");
    if (!student) {
      await storage.createUser({
        email: "student@demo.com",
        name: "Rahul Sharma",
        role: "student",
        isVerified: true,
      });
      console.log("✅ Sample student created: student@demo.com");
    }

    // Create sample internships
    const existingInternships = await storage.getInternshipsByEmployer(employerId);
    if (existingInternships.length === 0) {
      await storage.createInternship({
        employerId,
        title: "Full Stack Web Development",
        company: "TechNova Solutions",
        location: "Bangalore (Remote)",
        type: "Work From Home",
        stipend: "₹15,000 / month",
        duration: "3 Months",
        description: "We are looking for a passionate Full Stack Developer intern to join our team. You will work on real-world projects using MERN stack.",
        skills: "React, Node.js, MongoDB",
        perks: "Certificate, Letter of Recommendation",
        isActive: true,
      });

      await storage.createInternship({
        employerId,
        title: "UI/UX Design Intern",
        company: "TechNova Solutions",
        location: "Mumbai",
        type: "In-Office",
        stipend: "₹10,000 / month",
        duration: "2 Months",
        description: "Work closely with our lead designers to create beautiful and functional user interfaces for mobile and web apps.",
        skills: "Figma, Adobe XD, Prototyping",
        perks: "Flexible Hours, Mentorship",
        isActive: true,
      });

      console.log("✅ Sample internships created");
    }

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
