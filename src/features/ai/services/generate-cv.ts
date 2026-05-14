import type { CVFormData, CVStyle } from '@/types';
import { modernTemplate, classicTemplate, creativeTemplate } from '@/features/ai/services/cv-templates';

// Sort experience by startDate descending (most recent first)
function sortExperienceByDate(experience: CVFormData['experience']): CVFormData['experience'] {
  return [...experience].sort((a, b) => {
    const dateA = a.startDate || '1900-01';
    const dateB = b.startDate || '1900-01';
    return dateB.localeCompare(dateA);
  });
}

// Sort education by startDate descending (most recent first)
function sortEducationByDate(education: CVFormData['education']): CVFormData['education'] {
  return [...education].sort((a, b) => {
    const dateA = a.startDate || '1900-01';
    const dateB = b.startDate || '1900-01';
    return dateB.localeCompare(dateA);
  });
}

export async function generateCV(
  formData: CVFormData,
  style: CVStyle
): Promise<string> {
  // Sort experience and education by date (most recent first)
  const sortedData = {
    ...formData,
    summary: formData.summary.substring(0, 300),
    experience: sortExperienceByDate(formData.experience).map(exp => ({
      ...exp,
      description: exp.description.substring(0, 150)
    })),
    education: sortEducationByDate(formData.education),
  };

  // Generate HTML using hardcoded templates
  switch (style) {
    case 'modern':
      return modernTemplate(sortedData);
    case 'classic':
      return classicTemplate(sortedData);
    case 'creative':
      return creativeTemplate(sortedData);
    default:
      return modernTemplate(sortedData);
  }
}
