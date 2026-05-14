import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format').or(z.literal(''));

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().max(20, 'Phone number too long').or(z.literal('')),
  address: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').or(z.literal('')),
  website: z.string().url('Invalid website URL').or(z.literal('')),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: dateSchema,
  endDate: dateSchema,
  current: z.boolean(),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  grade: z.string().optional(),
});

export const skillGroupSchema = z.object({
  id: z.string(),
  category: z.string().min(1, 'Category is required'),
  items: z.array(z.string()),
});

export const resumeSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string().optional(),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillGroupSchema),
});

export type ResumeSchemaType = z.infer<typeof resumeSchema>;

export function validateResume(data: unknown) {
  const result = resumeSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: {} };
  }
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  return { valid: false, errors };
}
