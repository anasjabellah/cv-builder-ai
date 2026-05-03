import { NextRequest, NextResponse } from 'next/server';
import { generateCV } from '@/lib/generate-cv';
import type { CVFormData, CVStyle } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, style } = body as {
      formData: CVFormData;
      style: CVStyle;
    };

    if (!formData || !style) {
      return NextResponse.json(
        { error: 'Missing formData or style' },
        { status: 400 }
      );
    }

    const html = await generateCV(formData, style);

    return NextResponse.json({ html });
  } catch (error: unknown) {
    console.error('Generate CV error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate CV';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
