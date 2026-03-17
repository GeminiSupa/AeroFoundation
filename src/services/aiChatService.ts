const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send a chat message to the Groq API.
 * Requires VITE_GROQ_API_KEY in environment variables.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  systemPrompt?: string,
): Promise<ChatResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Groq API key is not configured. Add NEXT_PUBLIC_GROQ_API_KEY to your .env.local file.',
    };
  }

  const allMessages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt || 
        'You are a helpful AI assistant for a School Management System. ' +
        'Help users with questions about dashboards, student management, finance, payroll, attendance, and learning. ' +
        'Keep answers concise and practical.',
    },
    ...messages,
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: allMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.error?.message || `Groq API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return { success: false, error: 'No response from AI' };
    }

    return { success: true, message: assistantMessage };
  } catch (error: any) {
    console.error('Groq chat error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to connect to AI service',
    };
  }
}
