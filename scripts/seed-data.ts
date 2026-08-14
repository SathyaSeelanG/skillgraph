export const skills = [
  { id: "s1", name: "React", category: "Frontend" },
  { id: "s2", name: "Next.js", category: "Frontend" },
  { id: "s3", name: "TypeScript", category: "Language" },
  { id: "s4", name: "JavaScript", category: "Language" },
  { id: "s5", name: "Node.js", category: "Backend" },
  { id: "s6", name: "Python", category: "Language" },
  { id: "s7", name: "Django", category: "Backend" },
  { id: "s8", name: "FastAPI", category: "Backend" },
  { id: "s9", name: "PostgreSQL", category: "Database" },
  { id: "s10", name: "MySQL", category: "Database" },
  { id: "s11", name: "MongoDB", category: "Database" },
  { id: "s12", name: "AWS", category: "Cloud" },
  { id: "s13", name: "Docker", category: "DevOps" },
  { id: "s14", name: "Git", category: "DevOps" },
  { id: "s15", name: "Tailwind CSS", category: "Frontend" },
  { id: "s16", name: "GraphQL", category: "Backend" },
  { id: "s17", name: "Redis", category: "Database" },
  { id: "s18", name: "Kubernetes", category: "DevOps" },
  { id: "s19", name: "CI/CD", category: "DevOps" },
  { id: "s20", name: "Java", category: "Language" },
  { id: "s21", name: "Spring Boot", category: "Backend" },
  { id: "s22", name: "Go", category: "Language" },
  { id: "s23", name: "React Native", category: "Mobile" },
  { id: "s24", name: "Flutter", category: "Mobile" },
  { id: "s25", name: "Jest", category: "Testing" },
  { id: "s26", name: "Cypress", category: "Testing" },
  { id: "s27", name: "Vue.js", category: "Frontend" },
  { id: "s28", name: "Machine Learning", category: "AI/ML" },
  { id: "s29", name: "TensorFlow", category: "AI/ML" },
  { id: "s30", name: "Terraform", category: "DevOps" },
];

export const locations = [
  { id: "l1", city: "Chennai", state: "Tamil Nadu", country: "India" },
  { id: "l2", city: "Bangalore", state: "Karnataka", country: "India" },
  { id: "l3", city: "Hyderabad", state: "Telangana", country: "India" },
  { id: "l4", city: "Pune", state: "Maharashtra", country: "India" },
  { id: "l5", city: "Mumbai", state: "Maharashtra", country: "India" },
  { id: "l6", city: "Delhi", state: "Delhi", country: "India" },
  { id: "l7", city: "Coimbatore", state: "Tamil Nadu", country: "India" },
  { id: "l8", city: "Remote", state: "N/A", country: "India" },
  { id: "l9", city: "Kochi", state: "Kerala", country: "India" },
  { id: "l10", city: "Gurgaon", state: "Haryana", country: "India" },
];

export const companies = [
  { id: "c1", name: "TechCorp", industry: "Software", website: "https://techcorp.example.com" },
  { id: "c2", name: "Finlytics", industry: "Fintech", website: "https://finlytics.example.com" },
  { id: "c3", name: "HealthSync", industry: "Healthtech", website: "https://healthsync.example.com" },
  { id: "c4", name: "CloudNova", industry: "Cloud Infrastructure", website: "https://cloudnova.example.com" },
  { id: "c5", name: "ShopStream", industry: "E-commerce", website: "https://shopstream.example.com" },
  { id: "c6", name: "EduPath", industry: "Edtech", website: "https://edupath.example.com" },
  { id: "c7", name: "DataForge", industry: "Data Analytics", website: "https://dataforge.example.com" },
  { id: "c8", name: "PayBridge", industry: "Fintech", website: "https://paybridge.example.com" },
  { id: "c9", name: "AgroTech Labs", industry: "Agritech", website: "https://agrotech.example.com" },
  { id: "c10", name: "TravelMint", industry: "Travel", website: "https://travelmint.example.com" },
  { id: "c11", name: "StackWorks", industry: "Software", website: "https://stackworks.example.com" },
  { id: "c12", name: "MediCore", industry: "Healthtech", website: "https://medicore.example.com" },
  { id: "c13", name: "Loglytics", industry: "Logistics", website: "https://loglytics.example.com" },
  { id: "c14", name: "BrightHire", industry: "HR Tech", website: "https://brighthire.example.com" },
  { id: "c15", name: "Vantage Systems", industry: "Enterprise Software", website: "https://vantage.example.com" },
  { id: "c16", name: "NimbleOps", industry: "DevOps Tooling", website: "https://nimbleops.example.com" },
  { id: "c17", name: "GreenGrid", industry: "Cleantech", website: "https://greengrid.example.com" },
  { id: "c18", name: "QuantEdge", industry: "Fintech", website: "https://quantedge.example.com" },
  { id: "c19", name: "Playverse", industry: "Gaming", website: "https://playverse.example.com" },
  { id: "c20", name: "CivicStack", industry: "GovTech", website: "https://civicstack.example.com" },
];

export const jobTitles = [
  "Frontend Developer",
  "React Developer",
  "Full Stack Developer",
  "Node.js Developer",
  "Next.js Developer",
  "Software Engineer",
  "Backend Developer",
  "Python Developer",
];

const skillId = (name: string) => skills.find((s) => s.name === name)!.id;

// Skill sets per job title archetype, used to generate realistic REQUIRES relationships.
export const jobSkillProfiles: Record<string, string[]> = {
  "Frontend Developer": ["React", "JavaScript", "Tailwind CSS", "TypeScript"],
  "React Developer": ["React", "TypeScript", "Next.js", "Tailwind CSS"],
  "Full Stack Developer": ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL"],
  "Node.js Developer": ["Node.js", "TypeScript", "MongoDB", "Docker"],
  "Next.js Developer": ["Next.js", "React", "TypeScript", "GraphQL"],
  "Software Engineer": ["Python", "Java", "Git", "Docker", "AWS"],
  "Backend Developer": ["Node.js", "PostgreSQL", "Redis", "Docker", "AWS"],
  "Python Developer": ["Python", "Django", "FastAPI", "PostgreSQL"],
};

export const employmentTypes = ["Full-time", "Contract", "Internship"];

export const developerSeeds = [
  {
    id: "d1",
    name: "Sathya",
    experienceYears: 2,
    skills: ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL"],
    preferredLocation: "Chennai",
  },
  {
    id: "d2",
    name: "Priya",
    experienceYears: 4,
    skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Docker", "AWS"],
    preferredLocation: "Bangalore",
  },
  {
    id: "d3",
    name: "Arjun",
    experienceYears: 1,
    skills: ["JavaScript", "React", "Tailwind CSS", "Git"],
    preferredLocation: "Coimbatore",
  },
  {
    id: "d4",
    name: "Meera",
    experienceYears: 6,
    skills: ["Node.js", "TypeScript", "MongoDB", "GraphQL", "Docker", "Kubernetes"],
    preferredLocation: "Hyderabad",
  },
  {
    id: "d5",
    name: "Karthik",
    experienceYears: 3,
    skills: ["React", "TypeScript", "Next.js", "Node.js", "AWS", "CI/CD"],
    preferredLocation: "Remote",
  },
  {
    id: "d6",
    name: "Divya",
    experienceYears: 5,
    skills: ["Java", "Spring Boot", "MySQL", "Docker", "Git"],
    preferredLocation: "Pune",
  },
  {
    id: "d7",
    name: "Rahul",
    experienceYears: 2,
    skills: ["Python", "Machine Learning", "TensorFlow", "PostgreSQL"],
    preferredLocation: "Bangalore",
  },
  {
    id: "d8",
    name: "Ananya",
    experienceYears: 3,
    skills: ["React Native", "React", "TypeScript", "Jest"],
    preferredLocation: "Mumbai",
  },
  {
    id: "d9",
    name: "Vikram",
    experienceYears: 7,
    skills: ["Go", "Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],
    preferredLocation: "Gurgaon",
  },
  {
    id: "d10",
    name: "Sneha",
    experienceYears: 1,
    skills: ["Vue.js", "JavaScript", "Node.js", "MySQL"],
    preferredLocation: "Kochi",
  },
];

export { skillId };
