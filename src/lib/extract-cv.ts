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

  const prompt = `Extract CV data from text and return ONLY a valid JSON object matching this interface:

CVFormData: { personalInfo: { fullName, email, phone, address, linkedin, github, website, photo? }, summary, experience: { id, company, position, startDate, endDate, current, description }[], education: { id, institution, degree, field, startDate, endDate, grade }[], skills: { id, category, items[] }[], languages: { id, name, level }[], certifications: { id, name, issuer, date }[] }

Rules: ONLY JSON. No markdown. Generate IDs. Default lang level="Intermediate". current=true if no endDate. Dates: YYYY-MM. Empty string/array if not found. Extract education & certifications if present. Valid JSON.

Text:
${text.substring(0, 3000)}`;

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
