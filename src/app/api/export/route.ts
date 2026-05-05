import { NextRequest, NextResponse } from 'next/server';
import { generatePDFFromHTML } from '@/lib/export-pdf';
import { generateWordFromHTML } from '@/lib/export-word';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, format, filename } = body as {
      html?: string;
      format: 'pdf' | 'word';
      filename: string;
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
      const wordBuffer = await generateWordFromHTML(html);
      return new NextResponse(wordBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename || 'cv'}.docx"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Export error:', error);
    const message = error instanceof Error ? error.message : 'Failed to export';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
