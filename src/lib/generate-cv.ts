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
MODERN STYLE CV:
- Two-column layout: left sidebar 35% (dark navy #0F172A), right content 65% (white #FFFFFF)
- Sidebar: photo placeholder (circle, 120x120px, with border), name (white, 24px, Inter Bold), contact info (small, gray-400), skills with colored progress bars, languages
- Main content: professional summary, experience with timeline (blue dots + line), education section, certifications section
- Accent color: electric blue #3B82F6
- Font: Inter throughout (Google Fonts: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'))
- Section headers: uppercase, 14px, blue, letter-spacing wide
- Experience items: company name bold, position, dates right-aligned, ALWAYS most recent first
- Education items: institution bold, degree and field, dates, grade if available
- Certifications: list with name, issuer, and date
- Skills: display as progress bars or colored tags grouped by category
- Subtle dividers between sections
- Body text: #1E293B, secondary text: #64748B
- REQUIRED SECTIONS: Personal Info, Summary, Experience, Education, Skills, Languages, Certifications (if data exists)
`,
  classic: `
CLASSIC STYLE CV:
- Single column, traditional layout
- Header: full name centered, large serif font (Playfair Display, 36px, bold), title below
- Photo placeholder: circle 100x100px on the right side of header or centered below name
- Contact info centered below name in a single line
- Horizontal rules (#E5E7EB) between sections
- Section headers: Playfair Display, 20px, uppercase, centered, with horizontal rules above and below
- Body: Lora font, 14px, #1F2937
- Black and white with subtle gray (#F8F8F8) for alternate section backgrounds
- Traditional chronological layout with dates right-aligned, ALWAYS most recent first
- Education: institution name, degree, field of study, dates, grade
- Certifications: formatted list with name, issuer, date
- Skills: GROUPED BY CATEGORY with category headers (bold, uppercase), each category in a styled box with light gray background (#F3F4F6), border-left: 3px solid #1F2937
- Languages: list with level
- Google Fonts: @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:wght@400;500;600&display=swap')
- Very formal, suitable for law/finance/academia
- REQUIRED SECTIONS: Personal Info, Summary, Experience, Education, Skills (grouped), Languages, Certifications (if data exists)
`,
  creative: `
CREATIVE STYLE CV:
- Two-column layout: left sidebar 40% with gradient background (purple to indigo: linear-gradient(180deg, #7C3AED 0%, #4F46E5 100%))
- White sidebar text and icons, colored skill tags (#A78BFA background, white text)
- Photo placeholder: circle 120x120px in sidebar with white border
- Right side: big colorful section headings with unicode icons (🚀 Summary, 💼 Experience, 🎓 Education, 🏆 Certifications, 💡 Skills, 🌐 Languages)
- Experience cards with subtle box-shadow (0 1px 3px rgba(0,0,0,0.1)) and left colored border (4px solid #7C3AED)
- Education section: cards with institution, degree, field, dates
- Certifications section: badges/tags with certification name, issuer, date - REQUIRED if data exists
- Skills: colored tags grouped by category with category headers
- Languages: colored badges with language name and level
- Font: Poppins throughout (Google Fonts: @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'))
- Fun, modern, suitable for designers/marketers/startups
- Contact info in sidebar with unicode icons (📧 ✉️ 📍 🔗)
- Sidebar text should be white, main content text #1F2937
- REQUIRED SECTIONS: Personal Info, Summary, Experience, Education, Skills, Languages, Certifications (if data exists)
`,
};

export async function generateCV(
  formData: CVFormData,
  style: CVStyle
): Promise<string> {
  // Sort experience and education by date (most recent first)
  const sortedData = {
    ...formData,
    experience: sortExperienceByDate(formData.experience),
    education: sortEducationByDate(formData.education),
  };

  const stylePrompt = STYLE_PROMPTS[style];

  const systemPrompt = `You are an expert CV designer and HTML developer. Generate a complete, stunning, print-ready HTML+CSS CV.

Requirements:
- Return a COMPLETE, READY-TO-USE HTML document - it must start with <!DOCTYPE html> and include everything
- Single HTML file with ALL CSS embedded in a <style> tag in the <head>
- A4 size (210mm × 297mm), optimized for print - use @page { size: A4; margin: 0; }
- Professional typography using Google Fonts (import via @import in the CSS, NOT a link tag)
- Pixel-perfect spacing and alignment
- The design must look like it was made by a senior designer at a top design agency
- Use CSS variables for colors so the design is cohesive
- Include subtle design details: thin dividers, proper hierarchy
- Unicode symbols for icons (✉, 📍, 🔗, etc.) - do NOT use Font Awesome or any external icon libraries
- Print optimization: use -webkit-print-color-adjust: exact; print-color-adjust: exact;
- The HTML must be valid and complete
- NO markdown formatting, NO \`\`\`html\`\`\` wrappers, NO explanations - ONLY the raw HTML
- LANGUAGE CONSISTENCY: Generate the ENTIRE CV in the SAME language as the input data. Detect if the input is in English, French, Spanish, etc. and write ALL text (headers, labels, content) in that language. Do NOT mix languages.

${stylePrompt}

The CV should include these sections in order:
1. Header/Personal Info (name, contact details, photo placeholder as circle)
2. Professional Summary
3. Work Experience (most recent first - ALREADY SORTED in the data)
4. Education (most recent first - ALREADY SORTED in the data)
5. Skills (grouped by category with headers)
6. Languages
7. Certifications (REQUIRED if data exists)

CRITICAL:
- Education section MUST be rendered if education data exists in the input
- Certifications section MUST be rendered if certifications data exists in the input
- Experience MUST be displayed most recent first (already sorted in the data)
- ALL text must be in the SAME language as the input data - do NOT mix languages
- Photo placeholder MUST be a circle shape (border-radius: 50%)
- Return ONLY the complete HTML string starting with <!DOCTYPE html>. No markdown. No explanation.`;

  const userPrompt = `Generate a ${style} style CV for this person. The experience and education are already sorted by date (most recent first).

${JSON.stringify(sortedData, null, 2)}

Remember: Return ONLY the complete HTML document. No markdown, no code blocks, no explanations.`;

  const response = await callOpenRouter(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    8000
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
