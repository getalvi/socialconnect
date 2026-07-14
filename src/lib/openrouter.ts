const DEFAULT_MODEL = process.env.DEFAULT_AI_MODEL || 'google/gemini-2.0-flash-exp:free';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenRouterResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latencyMs: number;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  private async request(
    endpoint: string,
    body: Record<string, unknown>,
    retries = 3
  ): Promise<Record<string, unknown>> {
    for (let attempt = 0; attempt < retries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://socialconnect-ai.vercel.app',
            'X-Title': 'SocialConnect AI',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
        }

        return await response.json() as Record<string, unknown>;
      } catch (error) {
        clearTimeout(timeout);
        if (attempt === retries - 1) throw error;
        if (error instanceof DOMException && error.name === 'AbortError') {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async chat(messages: ChatMessage[], options: OpenRouterOptions = {}): Promise<OpenRouterResponse> {
    const start = Date.now();
    const model = options.model || DEFAULT_MODEL;

    const data = await this.request('/chat/completions', {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      stream: false,
    });

    const choices = data.choices as Array<{ message: { content: string } }>;
    const usage = data.usage as { prompt_tokens: number; completion_tokens: number; total_tokens: number };

    return {
      content: choices?.[0]?.message?.content || '',
      model: (data.model as string) || model,
      usage: {
        prompt_tokens: usage?.prompt_tokens || 0,
        completion_tokens: usage?.completion_tokens || 0,
        total_tokens: usage?.total_tokens || 0,
      },
      latencyMs: Date.now() - start,
    };
  }

  async vision(textPrompt: string, imageUrl: string, model?: string): Promise<OpenRouterResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: textPrompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ];
    return this.chat(messages, { model: model || 'google/gemini-2.0-flash-exp:free' });
  }

  async *chatStream(messages: ChatMessage[], options: OpenRouterOptions = {}): AsyncGenerator<string> {
    const model = options.model || DEFAULT_MODEL;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://socialconnect-ai.vercel.app',
        'X-Title': 'SocialConnect AI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed chunks
        }
      }
    }
  }

  async getModels(): Promise<Array<{ id: string; name: string; context_length: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      if (!response.ok) return [];
      const data = await response.json() as { data: Array<{ id: string; name?: string; context_length?: number }> };
      return (data.data || []).map((m) => ({
        id: m.id,
        name: m.name || m.id,
        context_length: m.context_length || 0,
      }));
    } catch {
      return [];
    }
  }
}

export const openRouter = new OpenRouterClient();