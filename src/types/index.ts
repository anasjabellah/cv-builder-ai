export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  website: string;
  photo?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

export type LanguageLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';

export interface LanguageEntry {
  id: string;
  name: string;
  level: LanguageLevel;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface CVFormData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillGroup[];
  languages: LanguageEntry[];
  certifications: CertificationEntry[];
}

export type CVStyle = 'modern' | 'classic' | 'creative';

export interface GenerateCVRequest {
  formData: CVFormData;
  style: CVStyle;
}

export interface GenerateCVResponse {
  html: string;
}

export const emptyPersonalInfo = (): PersonalInfo => ({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  github: '',
  website: '',
  photo: '',
});

export const emptyExperience = (): ExperienceEntry => ({
  id: crypto.randomUUID(),
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

export const emptyEducation = (): EducationEntry => ({
  id: crypto.randomUUID(),
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  grade: '',
});

export const emptySkillGroup = (): SkillGroup => ({
  id: crypto.randomUUID(),
  category: '',
  items: [],
});

export const emptyLanguage = (): LanguageEntry => ({
  id: crypto.randomUUID(),
  name: '',
  level: 'Intermediate',
});

export const emptyCertification = (): CertificationEntry => ({
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  date: '',
});

export const emptyFormData = (): CVFormData => ({
  personalInfo: emptyPersonalInfo(),
  summary: '',
  experience: [emptyExperience()],
  education: [emptyEducation()],
  skills: [emptySkillGroup()],
  languages: [emptyLanguage()],
  certifications: [],
});
