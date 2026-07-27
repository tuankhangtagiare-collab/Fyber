import { parseSSE } from '../streaming/sse';

const QWEN_API_KEY = process.env.QWEN_API_KEY || '';
const BASE_URL = 'https://qwen38-api-production.up.railway.app/v1';

export interface ChatRequest {
  model: string;
  messages: any[];
  tools?: any[];
  thinkingLevel?: string;
}

export async function streamQwenChat(request: ChatRequest) {
  const { model, messages, tools, thinkingLevel } = request;

  // Qwen handles reasoning intrinsically on max models, but we can pass enable_thinking if needed
  const enable_thinking = thinkingLevel !== 'Off';

  const body: any = {
    model: model || 'qwen3.8-max-preview',
    messages,
    stream: true,
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  // Not all models accept enable_thinking, but the docs say qwen3.8-max-preview ignores it
  // and other models respect it.
  body.enable_thinking = enable_thinking;

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${QWEN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qwen API Error: ${response.status} ${errorText}`);
  }

  return async function* () {
    if (!response.body) return;
    
    for await (const chunk of parseSSE(response.body)) {
      if (chunk.choices && chunk.choices.length > 0) {
        const delta = chunk.choices[0].delta;
        
        // Normalize reasoning_content and content streams
        if (delta.reasoning_content) {
          yield { type: 'reasoning', content: delta.reasoning_content };
        }
        
        if (delta.content) {
          yield { type: 'content', content: delta.content };
        }

        if (delta.tool_calls) {
          yield { type: 'tool_calls', tool_calls: delta.tool_calls };
        }
      }
    }
  }();
}
