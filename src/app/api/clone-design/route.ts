import { NextRequest, NextResponse } from 'next/server';
import type { CVFormData } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const imageFile = form.get('image') as File | null;
    const formDataJson = form.get('formData') as string | null;

    if (!imageFile || !formDataJson) {
      return NextResponse.json(
        { error: 'Missing required fields: image and formData' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const formData: CVFormData = JSON.parse(formDataJson);

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: imageFile.type,
                    data: base64Image,
                  },
                },
                {
                  text: `Analyze this CV/resume design carefully. Then recreate it as a complete, self-contained HTML+CSS file using this person's actual data:

${JSON.stringify(formData, null, 2)}

Requirements:
- Copy the EXACT layout, colors, fonts, and style of the CV in the image
- Replace all text with the provided person's real data
- Self-contained HTML with embedded CSS (no external dependencies except Google Fonts)
- A4 size, print-ready
- Return ONLY the raw HTML, no markdown, no explanation, no code blocks`,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 4000 },
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      throw new Error(
        geminiData.error?.message || 'Failed to call Gemini Vision API'
      );
    }

    const rawHtml = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const html = rawHtml.replace(/```html|```/g, '').trim();

    if (!html) {
      throw new Error('Gemini returned empty HTML');
    }

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Clone design error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
