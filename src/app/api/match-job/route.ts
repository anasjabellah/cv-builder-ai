import { NextRequest, NextResponse } from 'next/server';
import type { CVFormData, ExperienceEntry, EducationEntry, SkillGroup } from '@/types';

export const dynamic = 'force-dynamic';

// Helper: create a concise CV summary instead of sending full JSON
function summarizeCv(cv: CVFormData) {
  const name = cv.personalInfo?.fullName || '';
  const summary = (cv.summary || '').substring(0, 300); // first 300 chars
  const experience = (cv.experience || []).map((exp: ExperienceEntry) => ({
    company: exp.company,
    position: exp.position,
    startDate: exp.startDate,
    endDate: exp.endDate,
    // Only include first 100 chars of description
    description: (exp.description || '').substring(0, 100),
  }));
  const education = (cv.education || []).map((edu: EducationEntry) => ({
    institution: edu.institution,
    degree: edu.degree,
    field: edu.field,
  }));
  const skills = (cv.skills || []).map((sg: SkillGroup) => ({
    category: sg.category,
    items: sg.items?.slice(0, 10) || [], // max 10 items per category
  }));
  return { name, summary, experience, education, skills };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvData, jobDescription } = body as { cvData: CVFormData; jobDescription: string };
    if (!cvData || !jobDescription) {
      return NextResponse.json({ error: 'Missing cvData or jobDescription' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    // Truncate job description to 2000 characters
    const truncatedJobDesc = jobDescription.substring(0, 2000);

    // Build a concise CV summary
    const cvSummary = summarizeCv(cvData);

    const groqPayload = {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You are a job matching analyst. Compare the provided CV summary with the job description and return ONLY a valid JSON object with the following keys: matchPercentage (0-100), strengths (array of strings), gaps (array of strings), keywordsToAdd (array of strings), interviewQuestions (array of strings), tips (array of strings). No markdown, no code fences, no explanation.',
        },
        {
          role: 'user',
          content: `CV Summary:\n${JSON.stringify(cvSummary, null, 2)}\n\nJob Description:\n${truncatedJobDesc}`,
        },
      ],
      temperature: 0.3,
    };

    // Retry logic: if 429 error, wait 10 seconds and retry once
    let groqResponse: Response;
    let retryCount = 0;
    const maxRetries = 1; // retry once

    while (retryCount <= maxRetries) {
      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(groqPayload),
      });

      if (groqResponse.status !== 429 || retryCount === maxRetries) {
        break;
      }

      // 429 error - wait 10 seconds then retry
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    if (!groqResponse!.ok) {
      const errText = await groqResponse!.text();
      return NextResponse.json({ error: 'Groq API error', details: errText }, { status: 502 });
    }

    const groqData = await groqResponse!.json();
    let messageContent = groqData.choices?.[0]?.message?.content;

    // Clean up response: strip markdown fences and trim
    if (typeof messageContent === 'string') {
      messageContent = messageContent.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    // Extract JSON using regex
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

    return NextResponse.json({ success: true, result: analysis });
  } catch (error) {
    console.error('Match job error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
