const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  max_tokens: number = 4000
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set');
  }
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: max_tokens }
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini API error (${response.status}): ${JSON.stringify(data)}`);
  }
  return data.candidates[0].content.parts[0].text;
}
