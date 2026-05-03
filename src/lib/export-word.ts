import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import type { CVFormData } from '@/types';

export function generateWordFromFormData(formData: CVFormData): Document {
  const children: Paragraph[] = [];

  // Name
  children.push(
    new Paragraph({
      text: formData.personalInfo.fullName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Contact info
  const contactParts: string[] = [];
  if (formData.personalInfo.email) contactParts.push(formData.personalInfo.email);
  if (formData.personalInfo.phone) contactParts.push(formData.personalInfo.phone);
  if (formData.personalInfo.address) contactParts.push(formData.personalInfo.address);
  if (formData.personalInfo.linkedin) contactParts.push(formData.personalInfo.linkedin);
  if (formData.personalInfo.github) contactParts.push(formData.personalInfo.github);
  if (formData.personalInfo.website) contactParts.push(formData.personalInfo.website);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(' | '),
            size: 18,
            color: '666666',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Summary
  if (formData.summary) {
    children.push(
      new Paragraph({
        text: 'Professional Summary',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '7C3AED' },
        },
      }),
      new Paragraph({
        text: formData.summary,
        spacing: { after: 300 },
      })
    );
  }

  // Experience
  if (formData.experience.length > 0) {
    children.push(
      new Paragraph({
        text: 'Work Experience',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '7C3AED' },
        },
      })
    );

    for (const exp of formData.experience) {
      if (!exp.company && !exp.position) continue;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 22 }),
          ],
          spacing: { before: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: exp.company, size: 20 }),
            new TextRun({ text: `  |  ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, size: 18, color: '666666' }),
          ],
        })
      );
      if (exp.description) {
        children.push(
          new Paragraph({
            text: exp.description,
            spacing: { after: 200 },
          })
        );
      }
    }
  }

  // Education
  if (formData.education.length > 0) {
    children.push(
      new Paragraph({
        text: 'Education',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '7C3AED' },
        },
      })
    );

    for (const edu of formData.education) {
      if (!edu.institution && !edu.degree) continue;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree + (edu.field ? ` in ${edu.field}` : ''), bold: true, size: 22 }),
          ],
          spacing: { before: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: edu.institution, size: 20 }),
            edu.startDate
              ? new TextRun({ text: `  |  ${edu.startDate} - ${edu.endDate}`, size: 18, color: '666666' })
              : new TextRun(''),
          ],
        })
      );
      if (edu.grade) {
        children.push(
          new Paragraph({
            text: `Grade: ${edu.grade}`,
            spacing: { after: 200 },
          })
        );
      }
    }
  }

  // Skills
  if (formData.skills.length > 0) {
    children.push(
      new Paragraph({
        text: 'Skills',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '7C3AED' },
        },
      })
    );

    for (const group of formData.skills) {
      if (!group.category && group.items.length === 0) continue;
      if (group.category) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: group.category + ': ', bold: true, size: 20 })],
          })
        );
      }
      children.push(
        new Paragraph({
          text: group.items.join(', '),
          spacing: { after: 150 },
        })
      );
    }
  }

  // Languages
  if (formData.languages.length > 0) {
    children.push(
      new Paragraph({
        text: 'Languages',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '7C3AED' },
        },
      })
    );

    for (const lang of formData.languages) {
      if (!lang.name) continue;
      children.push(
        new Paragraph({
          text: `${lang.name} — ${lang.level}`,
          spacing: { after: 100 },
        })
      );
    }
  }

  // Certifications
  if (formData.certifications.length > 0) {
    children.push(
      new Paragraph({
        text: 'Certifications',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '7C3AED' },
        },
      })
    );

    for (const cert of formData.certifications) {
      if (!cert.name) continue;
      children.push(
        new Paragraph({
          children: [new TextRun({ text: cert.name, bold: true, size: 20 })],
          spacing: { before: 150 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: cert.issuer, size: 18 }),
            cert.date ? new TextRun({ text: `  |  ${cert.date}`, size: 18, color: '666666' }) : new TextRun(''),
          ],
          spacing: { after: 150 },
        })
      );
    }
  }

  return new Document({ sections: [{ children }] });
}

export async function generateWordBuffer(formData: CVFormData): Promise<Buffer> {
  const doc = generateWordFromFormData(formData);
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
