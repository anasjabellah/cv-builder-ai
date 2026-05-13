import { NextRequest, NextResponse } from 'next/server';
import { extractCV } from '@/features/resume/services/extract-cv';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or Word document.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cvData = await extractCV(buffer, file.type);

    return NextResponse.json({ formData: cvData });
  } catch (error: unknown) {
    console.error('Parse CV error:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse CV';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
