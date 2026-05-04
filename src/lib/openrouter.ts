const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  max_tokens: number = 2000
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
      max_tokens,
      temperature: 0.7,
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Groq API error (${response.status}): ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content;
}
