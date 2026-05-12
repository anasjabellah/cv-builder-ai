import { callOpenRouter } from '@/lib/groq';
import type { CVFormData } from '@/types';
import {
  emptyExperience,
  emptyEducation,
  emptySkillGroup,
  emptyLanguage,
  emptyCertification,
} from '@/types';

export interface TranslationConfig {
  targetLanguage: string;
  targetCountry: string;
}

/**
 * Build system prompt based on target language and country
 */
function buildSystemPrompt(targetLanguage: string, targetCountry: string): string {
  const language = targetLanguage.toLowerCase();
  const country = targetCountry.toLowerCase();

  // English US CVs are already handled elsewhere, but keep for completeness
  if (targetLanguage === 'English' && targetCountry === 'USA') {
    return `You are a professional CV writer. Translate and adapt the following CV data to American English.
Important cultural adaptations for American CVs:
- Concise, action verb focused
- Quantify achievements ("increased conversion by 15%")
- Omit personal details (photo, marital status, etc.)
- Highlight skills and experience relevant to the job description
- No personal pronouns
- Education section should list degrees, not schools with years (unless required)
Return ONLY a valid JSON object with the same structure as the input CVFormData,
with all text fields translated and culturally adapted.`;
  }

  // French CV cultural notes
  if (targetLanguage === 'French' && (country === 'france' || country === 'ca')) {
    return `You are a professional CV writer and cultural expert.
Translate and adapt the following CV data to French.
Important cultural adaptations for French CVs:
- Formal tone, use "Vous" instead of "Tu" when addressing oneself? Actually CV is self addressed but formal language.
- Include personal details (photo expected, address)
- Mention "Curriculum Vitae" at the top
- Use bullet points with proper French formatting
- Education should include "Formation" section
- Work experience should be in reverse chronological order
Return ONLY a valid JSON object with the same structure as the input CVFormData,
with all text fields translated and culturally adapted.`;
  }

  // German CV cultural notes
  if (targetLanguage === 'German' && country === 'de') {
    return `You are a professional CV writer and cultural expert.
Translate and adapt the following CV data to German.
Important cultural adaptations for German CVs:
- Very detailed, include full education history (Ausbildung)
- Use formal "Sie" style when describing achievements
- Include date of birth and nationality
- Use comma as decimal separator
- Education section should specify "Ausbildung" and "Studium"
- Work experience should include exact dates and company size
Return ONLY a valid JSON object with the same structure as the input CVFormData,
with all text fields translated and culturally adapted.`;
  }

  // Spanish CV cultural notes
  if (targetLanguage === 'Spanish' && (country === 'es' || country === 'mx' || country === 'ar')) {
    return `You are a professional CV writer and cultural expert.
Translate and adapt the following CV data to Spanish.
Important cultural adaptations for Spanish CVs:
- Warm tone, use "Estimado/a" style implicitly
- Include nationality
- Use formal language but friendly tone
- Education should be listed after experience
- Use "Currículum Vitae" title optionally
- Include language proficiency clearly
Return ONLY a valid JSON object with the same structure as the input CVFormData,
with all text fields translated and culturally adapted.`;
  }

  // Italian CV cultural notes
  if (targetLanguage === 'Italian' && country === 'it') {
    return `You are a professional CV writer and cultural expert.
Translate and adapt the following CV data to Italian.
Important cultural adaptations for Italian CVs:
- Professional but slightly formal tone
- Include personal details but not overly personal
- Use "Curriculum Vitae" title
- Education format should include "Formazione" and "Diploma"
- Work experience should include company size and role specifics
Return ONLY a valid JSON object with the same structure as the input CVFormData,
with all text fields translated and culturally adapted.`;
  }

  // Arabic CV (Gulf) cultural notes
  if (targetLanguage === 'Arabic' && country === 'sa') {
    return `You are a professional CV writer and cultural expert.
Translate and adapt the following CV data to Arabic (Gulf region).
Important cultural adaptations for Arabic CVs:
- Formal but slightly more personal tone than Western
- Include nationality and marital status optionally
- Education should be listed with grade averages
- Work experience should be in reverse chronological order
- Use Arabic punctuation and date format DD/MM/YYYY
- Include photo if provided
Return ONLY a valid JSON object with the same structure as the input CVFormData,
with all text fields translated and culturally adapted.`;
  }

  // Fallback
  return `You are a professional CV writer. Translate and adapt the following CV data to ${targetLanguage}.
Translate all textual fields while preserving structure.
Key tips:
- Adjust formality according to cultural norms
- For Japanese, emphasize group achievements over individual
- For Chinese, include birthdate and ID number if present
- Keep dates and numeric formats consistent
Return ONLY a valid JSON object with the same structure as the input CVFormData,
with all text fields translated and culturally adapted.`;
}

/**
 * Translate CV data using Groq AI
 */
export async function translateCV(
  cvData: CVFormData,
  targetLanguage: string,
  targetCountry: string
): Promise<CVFormData> {
  // Log input parameters for debugging
  console.log('translateCV called with', { targetLanguage, targetCountry, cvDataKeys: Object.keys(cvData) });
  // Verify Groq API key
  console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);

  const config = {
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(targetLanguage, targetCountry),
      },
      {
        role: 'user',
        content: JSON.stringify(cvData, null, 2),
      },
    ],
    temperature: 0.3,
    max_tokens: 4000,
  };

  const rawResponse = await callOpenRouter([
    {
      role: 'system',
      content: buildSystemPrompt(targetLanguage, targetCountry),
    },
    { role: 'user', content: JSON.stringify(cvData, null, 2) },
  ]);

  // Clean up response like in extract-cv.ts
  let cleaned = rawResponse.replace(
    /<thinking>[\s\S]*?<\/thinking>/g,
    ''
  ).replace(/\[THINKING\][\s\S]*?\[\/THINKING\]/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // Parse and return
  try {
    const parsed = JSON.parse(cleaned) as Partial<CVFormData>;
    // Merge structure to keep all fields intact
    const result: CVFormData = { ...cvData };
    if (parsed.personalInfo) Object.assign(result.personalInfo, parsed.personalInfo);
    if (parsed.summary !== undefined) result.summary = parsed.summary;
    if (Array.isArray(parsed.experience)) {
      result.experience = parsed.experience.map((exp, i) => ({
        ...emptyExperience(),
        ...exp,
        id: exp.id || crypto.randomUUID(),
      }));
      if (result.experience.length === 0) result.experience = [emptyExperience()];
    }
    if (Array.isArray(parsed.education)) {
      result.education = parsed.education.map((edu, i) => ({
        ...emptyEducation(),
        ...edu,
        id: edu.id || crypto.randomUUID(),
      }));
      if (result.education.length === 0) result.education = [emptyEducation()];
    }
    if (Array.isArray(parsed.skills)) {
      result.skills = parsed.skills.map((skill) => ({
        ...emptySkillGroup(),
        ...skill,
        id: skill.id || crypto.randomUUID(),
      }));
      if (result.skills.length === 0) result.skills = [emptySkillGroup()];
    }
    if (Array.isArray(parsed.languages)) {
      result.languages = parsed.languages.map((l) => ({
        ...emptyLanguage(),
        ...l,
        id: l.id || crypto.randomUUID(),
      }));
      if (result.languages.length === 0) result.languages = [emptyLanguage()];
    }
    if (Array.isArray(parsed.certifications)) {
      result.certifications = parsed.certifications.map((c) => ({
        ...emptyCertification(),
        ...c,
        id: c.id || crypto.randomUUID(),
      }));
    }
    return result;
  } catch (e) {
    console.error('Invalid JSON from translate CV:', cleaned);
    throw new Error('Invalid response from translation service');
  }
}