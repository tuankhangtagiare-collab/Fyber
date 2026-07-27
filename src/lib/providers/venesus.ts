import { parseSSE } from '../streaming/sse';
import { enforceQuota } from '../quota/venesus';

const VENESUS_API_KEY = process.env.VENESUS_API_KEY || '';
const BASE_URL = 'https://venesusai.lol/v1';

export async function streamVenesusChat(request: any, anonymousToken: string) {
  // Enforce quota before making the request
  const quotaAllowed = await enforceQuota(anonymousToken, 'chat');
  if (!quotaAllowed) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const { model, messages, tools } = request;

  const body: any = {
    model: model || 'ds/deepseek-v4-pro',
    messages,
    stream: true,
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VENESUS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Venesus API Error: ${response.status} ${errorText}`);
  }

  return async function* () {
    if (!response.body) return;
    
    for await (const chunk of parseSSE(response.body)) {
      if (chunk.choices && chunk.choices.length > 0) {
        const delta = chunk.choices[0].delta;
        
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
