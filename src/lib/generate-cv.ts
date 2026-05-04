import { callOpenRouter } from './openrouter';
import type { CVFormData, CVStyle } from '@/types';

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

const STYLE_PROMPTS: Record<CVStyle, string> = {
  modern: `
MODERN: Two-column, sidebar 35% dark navy #0F172A, content 65% white. Sidebar: circle photo 120px, name white 24px, skills progress bars. Main: timeline experience, education, certifications. Accent: #3B82F6. Font: Inter. Headers: uppercase 14px blue. REQUIRED: Personal Info, Summary, Experience, Education, Skills, Languages, Certifications.
`,
  classic: `
CLASSIC: Single column, traditional. Header: centered name serif 36px, photo circle 100px. Horizontal rules between sections. Headers: centered uppercase serif 20px. Skills: GROUPED BY CATEGORY with headers, light gray box #F3F4F6, border-left 3px #1F2937. Font: Playfair Display + Lora. REQUIRED: Personal Info, Summary, Experience, Education, Skills (grouped), Languages, Certifications.
`,
  creative: `
CREATIVE: Two-column, sidebar 40% purple gradient #7C3AED→#4F46E5. Sidebar: circle photo 120px, white text, skill tags. Main: unicode icons 🚀💼🎓🏆💡🌐, experience cards with left border 4px #7C3AED. Certifications: badges REQUIRED if data exists. Skills: colored tags grouped by category. Font: Poppins. Sidebar text white, content #1F2937. REQUIRED: Personal Info, Summary, Experience, Education, Skills, Languages, Certifications.
`,
};

export async function generateCV(
  formData: CVFormData,
  style: CVStyle
): Promise<string> {
  // Sort experience and education by date (most recent first), truncate descriptions
  const sortedData = {
    ...formData,
    summary: formData.summary.substring(0, 300),
    experience: sortExperienceByDate(formData.experience).map(exp => ({
      ...exp,
      description: exp.description.substring(0, 150)
    })),
    education: sortEducationByDate(formData.education),
  };

  const stylePrompt = STYLE_PROMPTS[style];

  const systemPrompt = `Expert CV designer. Generate complete HTML+CSS CV.

Rules: A4 size, CSS in <style> tag, @import Google Fonts, Unicode icons only, print-ready (-webkit-print-color-adjust: exact). Same language as input. NO markdown/code blocks/explanations - ONLY raw HTML starting with <!DOCTYPE html>.

${stylePrompt}

Sections: 1.Header/Personal Info (circle photo), 2.Summary, 3.Experience (recent first), 4.Education (if data), 5.Skills (grouped), 6.Languages, 7.Certifications (if data).`;

  const userPrompt = `Generate a ${style} style CV for this person. The experience and education are already sorted by date (most recent first).

${JSON.stringify(sortedData, null, 2)}

Remember: Return ONLY the complete HTML document. No markdown, no code blocks, no explanations.`;

  const response = await callOpenRouter(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    2000
  );

  let html = response.trim();

  // Strip any markdown code fences if present
  if (html.startsWith('```')) {
    html = html
      .replace(/^```(?:html)?\s*\n?/i, '')
      .replace(/\n?```\s*$/, '')
      .trim();
  }

  // Ensure it starts with DOCTYPE
  if (!html.startsWith('<!DOCTYPE')) {
    const doctypeMatch = html.match(/<!DOCTYPE[^>]*>/i);
    if (doctypeMatch && doctypeMatch.index !== undefined) {
      html = html.substring(doctypeMatch.index);
    } else {
      html = '<!DOCTYPE html>\n' + html;
    }
  }

  return html;
}
