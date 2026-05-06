import { NextRequest, NextResponse } from 'next/server';
import type { CVFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData } = body as { formData: CVFormData };

    if (!formData) {
      return NextResponse.json(
        { error: 'Missing formData' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze this CV data and provide a score from 0-100.

CV Data:
${JSON.stringify(formData, null, 2)}

Evaluate these criteria and provide a JSON response with this exact structure:
{
  "score": <number 0-100>,
  "strengths": ["list of what's good in the CV"],
  "weaknesses": ["list of what needs improvement"],
  "suggestions": ["specific actionable suggestions to improve ATS compatibility"]
}

Scoring criteria:
1. Professional summary exists and is 50-200 words: up to 20 points
2. Contact info complete (email, phone, address): up to 15 points
3. Work experience has dates and descriptions: up to 25 points
4. Skills section filled with relevant skills: up to 20 points
5. Uses strong action verbs and keywords: up to 10 points
6. No special characters or formatting issues: up to 10 points

Be strict but fair. A typical good CV should score 70-85. Return ONLY valid JSON, no markdown formatting, no code fences.`;

    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const groqHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    };

    // Log the full request details
    console.log('[ATS] ===== GROQ API REQUEST =====');
    console.log('[ATS] URL:', groqUrl);
    console.log('[ATS] Headers:', { ...groqHeaders, 'Authorization': 'Bearer [REDACTED]' });
    console.log('[ATS] Body:', JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt.substring(0, 200) + '...' }],
      temperature: 0.3,
      max_tokens: 1024,
    }));

    const groqRes = await fetch(groqUrl, {
      method: 'POST',
      headers: groqHeaders,
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    // Log the raw response before parsing
    const groqText = await groqRes.text();
    console.log('[ATS] ===== GROQ API RESPONSE =====');
    console.log('[ATS] Response status:', groqRes.status, groqRes.statusText);
    console.log('[ATS] Response headers:', Object.fromEntries(groqRes.headers.entries()));
    console.log('[ATS] Raw response text (first 2000 chars):', groqText.substring(0, 2000));
    console.log('[ATS] Raw response length:', groqText.length);

    // Now parse the JSON from the text
    let groqData;
    try {
      groqData = JSON.parse(groqText);
    } catch (parseError) {
      console.error('[ATS] Failed to parse Groq response as JSON:', parseError);
      console.error('[ATS] Raw response was:', groqText);
      return NextResponse.json(
        { error: 'Invalid response from ATS analyzer', rawResponse: groqText.substring(0, 500) },
        { status: 500 }
      );
    }

    if (!groqRes.ok) {
      console.error('[ATS] Groq ATS check error:', groqData);
      throw new Error(groqData.error?.message || 'ATS check failed');
    }

    const content = groqData.choices?.[0]?.message?.content || '';
    console.log('[ATS] Content from Groq (first 500 chars):', content.substring(0, 500));

    // Try to extract JSON from the response (may be wrapped in markdown)
    let result;
    try {
      const jsonMatch = content.match(/\{\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      result = JSON.parse(jsonString);
      console.log('[ATS] Successfully parsed result:', { score: result.score, strengthsCount: result.strengths?.length, weaknessesCount: result.weaknesses?.length, suggestionsCount: result.suggestions?.length });
    } catch (parseError) {
      console.error('[ATS] Failed to parse ATS response. Raw content:', content);
      return NextResponse.json(
        { error: 'Invalid response from ATS analyzer', rawResponse: content.substring(0, 500) },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[ATS] ATS check error:', error);
    const message = error instanceof Error ? error.message : 'Failed to check ATS score';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
