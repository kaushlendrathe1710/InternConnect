
export interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Work From Home' | 'In-Office' | 'Hybrid';
  stipend: string;
  duration: string;
  postedAgo: string;
  logo: string;
  tags: string[];
  description: string;
}

export const MOCK_INTERNSHIPS: Internship[] = [
  {
    id: 1,
    title: "Full Stack Web Development",
    company: "TechNova Solutions",
    location: "Bangalore (Remote)",
    type: "Work From Home",
    stipend: "₹15,000 / month",
    duration: "3 Months",
    postedAgo: "2 days ago",
    logo: "https://ui-avatars.com/api/?name=TechNova&background=0D8ABC&color=fff",
    tags: ["React", "Node.js", "MongoDB"],
    description: "We are looking for a passionate Full Stack Developer intern to join our team. You will work on real-world projects using MERN stack."
  },
  {
    id: 2,
    title: "Digital Marketing Intern",
    company: "GrowthX Agency",
    location: "Mumbai",
    type: "In-Office",
    stipend: "₹10,000 / month",
    duration: "2 Months",
    postedAgo: "5 hours ago",
    logo: "https://ui-avatars.com/api/?name=GrowthX&background=FF5733&color=fff",
    tags: ["SEO", "Social Media", "Content Writing"],
    description: "Join our marketing team to learn and execute SEO strategies and social media campaigns for top brands."
  },
  {
    id: 3,
    title: "UI/UX Design Intern",
    company: "CreativePulse",
    location: "Delhi (Hybrid)",
    type: "Hybrid",
    stipend: "₹8,000 - ₹12,000 / month",
    duration: "6 Months",
    postedAgo: "1 day ago",
    logo: "https://ui-avatars.com/api/?name=CreativePulse&background=6C63FF&color=fff",
    tags: ["Figma", "Adobe XD", "Prototyping"],
    description: "Work closely with our lead designers to create beautiful and functional user interfaces for mobile and web apps."
  },
  {
    id: 4,
    title: "Data Science Intern",
    company: "DataFlow Analytics",
    location: "Pune",
    type: "In-Office",
    stipend: "₹20,000 / month",
    duration: "4 Months",
    postedAgo: "3 days ago",
    logo: "https://ui-avatars.com/api/?name=DataFlow&background=2ECC71&color=fff",
    tags: ["Python", "Machine Learning", "SQL"],
    description: "Analyze large datasets and build predictive models. Strong knowledge of Python and SQL is required."
  },
  {
    id: 5,
    title: "Content Writing Intern",
    company: "WriteRight",
    location: "Remote",
    type: "Work From Home",
    stipend: "₹5,000 / month",
    duration: "1 Month",
    postedAgo: "Just now",
    logo: "https://ui-avatars.com/api/?name=WriteRight&background=F1C40F&color=fff",
    tags: ["Blogging", "Creative Writing", "English"],
    description: "We need a creative writer to craft engaging blog posts and articles for our lifestyle magazine."
  }
];

export interface User {
  name: string;
  role: 'student' | 'employer';
  email: string;
}

export const MOCK_USER: User = {
  name: "Rahul Sharma",
  role: "student",
  email: "rahul.sharma@example.com"
};
