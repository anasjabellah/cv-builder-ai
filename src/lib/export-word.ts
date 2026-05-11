import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';
import type { CVFormData } from '@/types';

function p(runs: TextRun[], spacing = 120): Paragraph {
  return new Paragraph({ children: runs, spacing: { after: spacing } });
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: '2196F3' })],
    border: { bottom: { style: 'single', size: 6, color: '2196F3', space: 4 } },
    spacing: { before: 240, after: 120 },
  });
}

export async function generateWordFromHTML(html: string, formData?: CVFormData): Promise<Buffer> {
  try {
    const data = formData;
    const children: Paragraph[] = [];

    if (!data) {
      const doc = new Document({ sections: [{ children: [new Paragraph({ text: 'No CV data available' })] }] });
      return Packer.toBuffer(doc);
    }

    // HEADER
    children.push(new Paragraph({
      children: [new TextRun({ text: data.personalInfo.fullName, bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }));

    // Contact info
    const contact = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.address, data.personalInfo.linkedin].filter(Boolean).join(' | ');
    if (contact) children.push(new Paragraph({
      children: [new TextRun({ text: contact, size: 18, color: '666666' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));

    // SUMMARY
    if (data.summary) {
      children.push(sectionTitle('Professional Summary'));
      children.push(p([new TextRun({ text: data.summary, size: 20 })]));
    }

    // EXPERIENCE
    if (data.experience?.length) {
      children.push(sectionTitle('Work Experience'));
      for (const exp of data.experience) {
        const dates = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
        children.push(new Paragraph({
          children: [
            new TextRun({ text: exp.company, bold: true, size: 22 }),
            new TextRun({ text: `  ${dates}`, size: 18, color: '888888' }),
          ],
          spacing: { after: 40 },
        }));
        if (exp.position) children.push(p([new TextRun({ text: exp.position, italics: true, size: 20 })], 40));
        if (exp.description) children.push(p([new TextRun({ text: exp.description, size: 19 })]));
      }
    }

    // EDUCATION
    if (data.education?.length) {
      children.push(sectionTitle('Education'));
      for (const edu of data.education) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: edu.institution, bold: true, size: 22 }),
            new TextRun({ text: `  ${edu.startDate} - ${edu.endDate}`, size: 18, color: '888888' }),
          ],
          spacing: { after: 40 },
        }));
        const degreeText = [edu.degree, edu.field].filter(Boolean).join(' in ');
        if (degreeText) children.push(p([new TextRun({ text: degreeText, italics: true, size: 20 })]));
      }
    }

    // SKILLS
    if (data.skills?.length) {
      children.push(sectionTitle('Skills'));
      for (const skill of data.skills) {
        children.push(p([
          new TextRun({ text: `${skill.category}: `, bold: true, size: 20 }),
          new TextRun({ text: skill.items.join(', '), size: 20 }),
        ]));
      }
    }

    // LANGUAGES
    if (data.languages?.length) {
      children.push(sectionTitle('Languages'));
      children.push(p([new TextRun({
        text: data.languages.map(l => `${l.name} (${l.level})`).join('  |  '),
        size: 20,
      })]));
    }

    // CERTIFICATIONS
    if (data.certifications?.length) {
      children.push(sectionTitle('Certifications'));
      for (const cert of data.certifications) {
        children.push(p([
          new TextRun({ text: cert.name, bold: true, size: 20 }),
          new TextRun({ text: `  — ${cert.issuer} (${cert.date})`, size: 18, color: '888888' }),
        ]));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }
        },
        children,
      }]
    });

    return Packer.toBuffer(doc);
  } catch (err) {
    console.error('Word export error:', err);
    throw new Error('Failed to generate Word document');
  }
}
