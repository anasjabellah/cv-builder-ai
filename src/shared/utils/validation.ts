import type { CVFormData, ExperienceEntry, EducationEntry } from '@/types';

export interface ValidationErrors {
  personalInfo?: {
    email?: string;
    phone?: string;
  };
  experience?: {
    startDate?: string;
    endDate?: string;
  }[];
  education?: {
    startDate?: string;
    endDate?: string;
  }[];
  form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}$/;

function isValidDate(date: string): boolean {
  if (!date) return true; // optional, empty is ok
  if (!DATE_REGEX.test(date)) return false;
  const [year, month] = date.split('-').map(Number);
  return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
}

function isDateAfter(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  return endDate >= startDate;
}

export function validatePersonalInfo(data: CVFormData['personalInfo']): ValidationErrors['personalInfo'] {
  const errors: ValidationErrors['personalInfo'] = {};

  if (data.email && !EMAIL_REGEX.test(data.email)) {
    errors.email = 'Invalid email format (e.g. john@example.com)';
  }

  if (data.phone && data.phone.trim() && data.phone.trim().length < 5) {
    errors.phone = 'Phone number is too short';
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}

export function validateExperience(experience: ExperienceEntry[]): ValidationErrors['experience'] {
  const errors: ValidationErrors['experience'] = [];

  experience.forEach((exp, index) => {
    const expErrors: any = {};

    if (exp.startDate && !isValidDate(exp.startDate)) {
      expErrors.startDate = 'Invalid date format (YYYY-MM)';
    }

    if (exp.endDate && !isValidDate(exp.endDate)) {
      expErrors.endDate = 'Invalid date format (YYYY-MM)';
    }

    if (exp.startDate && exp.endDate && !exp.current) {
      if (isValidDate(exp.startDate) && isValidDate(exp.endDate)) {
        if (!isDateAfter(exp.startDate, exp.endDate)) {
          expErrors.endDate = 'End date must be after start date';
        }
      }
    }

    if (Object.keys(expErrors).length > 0) {
      errors[index] = expErrors;
    }
  });

  return errors.length > 0 ? errors : undefined;
}

export function validateEducation(education: EducationEntry[]): ValidationErrors['education'] {
  const errors: ValidationErrors['education'] = [];

  education.forEach((edu, index) => {
    const eduErrors: any = {};

    if (edu.startDate && !isValidDate(edu.startDate)) {
      eduErrors.startDate = 'Invalid date format (YYYY-MM)';
    }

    if (edu.endDate && !isValidDate(edu.endDate)) {
      eduErrors.endDate = 'Invalid date format (YYYY-MM)';
    }

    if (edu.startDate && edu.endDate) {
      if (isValidDate(edu.startDate) && isValidDate(edu.endDate)) {
        if (!isDateAfter(edu.startDate, edu.endDate)) {
          eduErrors.endDate = 'End date must be after start date';
        }
      }
    }

    if (Object.keys(eduErrors).length > 0) {
      errors[index] = eduErrors;
    }
  });

  return errors.length > 0 ? errors : undefined;
}

export function validateFormData(data: CVFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  const personalErrors = validatePersonalInfo(data.personalInfo);
  if (personalErrors) errors.personalInfo = personalErrors;

  const expErrors = validateExperience(data.experience);
  if (expErrors) errors.experience = expErrors;

  const eduErrors = validateEducation(data.education);
  if (eduErrors) errors.education = eduErrors;

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return !!(
    errors.personalInfo ||
    (errors.experience && errors.experience.length > 0) ||
    (errors.education && errors.education.length > 0) ||
    errors.form
  );
}
