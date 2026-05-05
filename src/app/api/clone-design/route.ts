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

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const formData: CVFormData = JSON.parse(formDataJson);

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'CV Builder AI',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${imageFile.type};base64,${base64Image}`
                }
              },
              {
                type: 'text',
                text: `Analyze this CV/resume design carefully. Then recreate it as a complete self-contained HTML+CSS file using this person's actual data:

${JSON.stringify(formData)}

Requirements:
- Copy the EXACT layout, colors, fonts, and style of the CV in the image
- Replace all text with the provided person's real data
- Self-contained HTML with embedded CSS (no external dependencies except Google Fonts)
- A4 size, print-ready
- Return ONLY the raw HTML starting with <!DOCTYPE html>, no markdown, no explanation`
              }
            ]
          }
        ],
        max_tokens: 4000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || 'Failed to call OpenRouter Vision API'
      );
    }

    const html = data.choices?.[0]?.message?.content || '';

    if (!html) {
      throw new Error('OpenRouter returned empty HTML');
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
