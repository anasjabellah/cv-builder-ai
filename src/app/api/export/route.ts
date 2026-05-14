import { NextRequest, NextResponse } from 'next/server';
import { generatePDFFromHTML } from '@/features/export/services/export-pdf';
import { generateWordFromHTML } from '@/features/export/services/export-word';

export async function POST(request: NextRequest) {
  // Set a 30‑second timeout to avoid hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const body = await request.json();
    const { html, format, filename, formData } = body as {
      html?: string;
      format: string; // will validate below
      filename?: string;
      formData?: import('@/types').CVFormData;
    };

    // Validate format
    if (!['pdf', 'word'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

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
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Export request timed out' }, { status: 504 });
    }
    console.error('Export error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
