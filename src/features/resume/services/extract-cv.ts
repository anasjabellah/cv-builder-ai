import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { callOpenRouter } from '@/features/ai/providers/groq';
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

  const prompt = `You are an expert CV/resume parser. Extract the following information from the text and return ONLY a valid JSON object. Do not include any explanations, markdown, or additional text.

Extract these fields exactly:

1. personalInfo:
   - fullName: The person's full name as it appears at the top of the CV
   - email: Email address (look for @ symbol)
   - phone: Phone number (may include country code, spaces, dashes)
   - address: Physical address or location (city, country)
   - linkedin: LinkedIn profile URL or username
   - github: GitHub profile URL or username
   - website: Personal website or portfolio URL
   - photo: Leave as empty string (not extractable from text)

2. summary: Professional summary or profile section (usually under the name or at the top)

3. experience: Array of work experiences, ordered from most recent to oldest. For each job:
   - company: Company name
   - position: Job title/position
   - startDate: Start date in YYYY-MM format (if only year, use YYYY-01)
   - endDate: End date in YYYY-MM format, or "Present" if current
   - current: true if endDate is "Present" or if no end date and job is current
   - description: Responsibilities and achievements (bullet points or paragraph)

4. education: Array of education entries, ordered from most recent to oldest. For each:
   - institution: School/university name
   - degree: Degree name (e.g., Bachelor of Science, Master's)
   - field: Field of study or major
   - startDate: Start date in YYYY-MM format
   - endDate: End date in YYYY-MM format
   - grade: GPA, honors, or grade if mentioned

5. skills:
   - First, look for a skills section or any listing of technologies, programming languages, tools, frameworks, etc.
   - Group skills by logical categories (e.g., Back End, Front End, Database, Tools, Languages, Frameworks, Cloud, DevOps, etc.).
   - Each group should have:
        * category: The category name (string)
        * items: Array of specific skill strings in that category
   - If no clear categories exist but skills are listed, put all skills in one group with category "Technical Skills".
   - If no skills are found, return an empty array.

6. languages: Array of languages with proficiency levels
   - name: Language name (English, Spanish, etc.)
   - level: Proficiency level (Beginner, Intermediate, Advanced, Native or Fluent)

7. certifications: Array of certifications
   - name: Certification name
   - issuer: Organization that issued the certification
   - date: Date obtained in YYYY-MM format (or just year)

Important rules:
- Return ONLY valid JSON, no markdown code blocks
- If a field is not found, use empty string for strings, empty array for arrays
- For dates: use YYYY-MM format. If only year is given, use YYYY-01
- For experience: set current=true if end date is "Present" or if no end date and it's the most recent job
- For skills: group similar skills together under logical categories
- Generate unique IDs for each array element (you can use placeholder IDs, they will be replaced)
- The text to extract from is:

${text.substring(0, 4000)}`;

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
