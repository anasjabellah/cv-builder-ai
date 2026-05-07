import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid content' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an ATS (Applicant Tracking System) analyzer. Analyze the provided resume content and give feedback on formatting, keywords, and ATS compatibility. Return ONLY a valid JSON object, no markdown, no code fences, no explanation. Just the raw JSON. The JSON must have keys: score (0-100), suggestions (array of strings), issues (array of strings).',
          },
          {
            role: 'user',
            content: `Analyze this resume for ATS compatibility:\n\n${content}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return NextResponse.json({ error: 'Groq API error', details: errorText }, { status: 502 });
    }

    const groqData = await groqResponse.json();
    let messageContent = groqData.choices?.[0]?.message?.content;

    // Clean the response: remove markdown code fences and trim
    if (typeof messageContent === 'string') {
      messageContent = messageContent.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    // Extract JSON object using regex
    let analysis;
    if (typeof messageContent === 'string') {
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch {
          analysis = { raw: messageContent };
        }
      } else {
        analysis = { raw: messageContent };
      }
    } else {
      analysis = { raw: messageContent };
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('ATS check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
