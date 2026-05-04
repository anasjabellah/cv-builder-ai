import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { callOpenRouter } from './openrouter';
import type { CVFormData } from '@/types';
import { emptyFormData } from '@/types';

export async function extractCV(
  fileBuffer: Buffer,
  mimeType: string
): Promise<CVFormData> {
  let text: string;

  if (mimeType === 'application/pdf') {
    const data = await pdf(fileBuffer);
    text = data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    text = result.value;
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or Word document.');
  }

  if (!text.trim()) {
    throw new Error('Could not extract text from the uploaded file.');
  }

  const formData = emptyFormData();

  const prompt = `Extract ALL CV data from this text and return ONLY a valid JSON object matching this TypeScript interface:

interface CVFormData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    github: string;
    website: string;
    photo?: string;
  };
  summary: string;
  experience: { id: string; company: string; position: string; startDate: string; endDate: string; current: boolean; description: string }[];
  education: { id: string; institution: string; degree: string; field: string; startDate: string; endDate: string; grade: string }[];
  skills: { id: string; category: string; items: string[] }[];
  languages: { id: string; name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native' }[];
  certifications: { id: string; name: string; issuer: string; date: string }[];
}

CRITICAL EXTRACTION RULES:
- Return ONLY the JSON object, no markdown, no explanation, no \`\`\`json\`\`\` wrappers.
- Extract ALL education entries: include school/university name (institution), degree type (Bachelor, Master, PhD, etc.), field of study, dates, and grades if available.
- Extract ALL work experience entries with complete descriptions.
- Extract ALL skills and group them by category (Technical, Soft Skills, Tools, Languages, etc.).
- Extract ALL certifications with issuer and date.
- Generate unique string IDs for all id fields (can be "exp1", "edu1", "skill1", etc.).
- Use "Intermediate" as default language level if unknown.
- Set current=true for jobs without an end date, otherwise false.
- Dates must be in YYYY-MM or MM/YYYY format.
- If a field cannot be found, use empty string or empty array as appropriate.
- Education and Certifications sections ARE REQUIRED - extract them if they exist in the text.
- Ensure valid JSON syntax.

Text to parse:
${text.substring(0, 8000)}`;

  const response = await callOpenRouter([
    {
      role: 'system',
      content: 'You are a CV data extraction expert. Return only valid JSON.',
    },
    { role: 'user', content: prompt },
  ]);

  let cleaned = response.trim();

  // Remove thinking tags (Gemini 2.5 flash includes these)
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
  cleaned = cleaned.replace(/\[THINKING\][\s\S]*?\[\/THINKING\]/g, '').trim();

  // Remove markdown code fences
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Extract JSON object if there's text before/after it
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(cleaned) as Partial<CVFormData>;
    return mergeWithDefaults(parsed, formData);
  } catch (e) {
    console.error('RAW RESPONSE:', JSON.stringify(response));
    console.error('Raw Gemini response:', response);
    console.error('Failed to parse CV JSON:', cleaned);
    throw new Error('Failed to parse the CV data. Please try filling the form manually.');
  }
}

function mergeWithDefaults(
  parsed: Partial<CVFormData>,
  defaults: CVFormData
): CVFormData {
  const result = { ...defaults };

  if (parsed.personalInfo) {
    result.personalInfo = { ...defaults.personalInfo, ...parsed.personalInfo };
  }
  if (parsed.summary !== undefined) {
    result.summary = parsed.summary;
  }
  if (Array.isArray(parsed.experience)) {
    result.experience = parsed.experience.map((e) => ({
      ...emptyFormData().experience[0],
      ...e,
      id: e.id || crypto.randomUUID(),
    }));
    if (result.experience.length === 0) {
      result.experience = [defaults.experience[0]];
    }
  }
  if (Array.isArray(parsed.education)) {
    result.education = parsed.education.map((e) => ({
      ...emptyFormData().education[0],
      ...e,
      id: e.id || crypto.randomUUID(),
    }));
    if (result.education.length === 0) {
      result.education = [defaults.education[0]];
    }
  }
  if (Array.isArray(parsed.skills)) {
    result.skills = parsed.skills.map((s) => ({
      ...emptyFormData().skills[0],
      ...s,
      id: s.id || crypto.randomUUID(),
    }));
    if (result.skills.length === 0) {
      result.skills = [defaults.skills[0]];
    }
  }
  if (Array.isArray(parsed.languages)) {
    result.languages = parsed.languages.map((l) => ({
      ...emptyFormData().languages[0],
      ...l,
      id: l.id || crypto.randomUUID(),
    }));
    if (result.languages.length === 0) {
      result.languages = [defaults.languages[0]];
    }
  }
  if (Array.isArray(parsed.certifications)) {
    result.certifications = parsed.certifications.map((c) => ({
      ...emptyFormData().certifications[0],
      ...c,
      id: c.id || crypto.randomUUID(),
    }));
  }

  return result;
}
