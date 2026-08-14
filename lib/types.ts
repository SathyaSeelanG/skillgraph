export interface Developer {
  id: string;
  name: string;
  experienceYears: number;
  skills: string[];
  preferredLocation: string | null;
}

export interface DeveloperSummary {
  id: string;
  name: string;
  experienceYears: number;
  skills: string[];
}

export interface JobMatch {
  jobId: string;
  title: string;
  company: string;
  matchingSkills: number;
  requiredSkills: number;
  matchingSkillNames: string[];
  requiredSkillNames: string[];
  matchScore: number;
}

export interface JobListItem {
  id: string;
  title: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  employmentType: string;
  companyName: string;
  city: string;
  requiredSkills: string[];
}

export interface JobDetail {
  id: string;
  title: string;
  description: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  employmentType: string;
  companyName: string;
  city: string;
  requiredSkills: string[];
}

export interface RelatedJob {
  jobId: string;
  title: string;
  companyName: string;
  sharedSkills: number;
}

export interface SkillListItem {
  id: string;
  name: string;
  category: string;
  jobCount: number;
}

export interface SkillDetail {
  skillName: string;
  jobCount: number;
  companies: string[];
  locations: string[];
}

export interface RelatedSkill {
  relatedSkill: string;
  sharedJobs: number;
}

export type GraphNodeType = "Developer" | "Skill" | "Job" | "Company" | "Location";

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const PRIMARY_DEVELOPER_ID = "d1";

export const ACTIVE_DEVELOPER_STORAGE_KEY = "skillgraph:activeDeveloperId";
