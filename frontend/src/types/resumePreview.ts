export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

export interface ResumeExperienceEntry {
  title: string;
  company: string;
  location: string;
  dateRange: string;
  bullets: string[];
}

export interface ResumeProjectEntry {
  name: string;
  technologies: string[];
  bullets: string[];
}

export interface ResumeEducationEntry {
  degree: string;
  institution: string;
  year: string;
  details: string;
}

export interface ResumePreviewData {
  personalInfo: ResumePersonalInfo;
  professionalSummary: string;
  skills: string[];
  experience: ResumeExperienceEntry[];
  projects: ResumeProjectEntry[];
  education: ResumeEducationEntry[];
  certifications: string[];
  templateId: string;
  atsScore?: number;
  matchScore?: number;
  keywordsAdded?: string[];
}
