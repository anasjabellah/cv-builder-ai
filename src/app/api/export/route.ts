import { NextRequest, NextResponse } from 'next/server';
import { generatePDFFromHTML } from '@/lib/export-pdf';
import { generateWordFromHTML } from '@/lib/export-word';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, format, filename, formData } = body as {
      html?: string;
      format: 'pdf' | 'word';
      filename: string;
      formData?: import('@/types').CVFormData;
    };

    if (format === 'pdf') {
      if (!html) {
        return NextResponse.json({ error: 'Missing HTML content' }, { status: 400 });
      }
      const pdfBuffer = await generatePDFFromHTML(html);
      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename || 'cv'}.pdf"`,
        },
      });
    }

    if (format === 'word') {
      if (!html) {
        return NextResponse.json({ error: 'Missing HTML content' }, { status: 400 });
      }
      const wordBuffer = await generateWordFromHTML(html, formData);
      return new NextResponse(wordBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="cv.docx"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Word export error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
