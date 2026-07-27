import { NextRequest } from 'next/server';
import { getAnonymousToken } from '@/lib/session/anonymous';
import { streamChat } from '@/lib/providers/router';
import { getSystemPrompt, ThinkingLevel } from '@/lib/prompts/thinking';
import { createEventStreamResponse } from '@/lib/streaming/sse';
import { globalToolRegistry } from '@/lib/agent/tools';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, provider, model, thinkingLevel, skillsEnabled } = body;

    const token = await getAnonymousToken();

    // 1. Compose System Prompt based on Thinking Level and Skills
    const systemPrompt = getSystemPrompt(
      (thinkingLevel as ThinkingLevel) || 'Off', 
      skillsEnabled || []
    );

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // 2. Resolve available tools from registry based on active skills
    const availableTools = globalToolRegistry.getAvailableTools(skillsEnabled || []);
    const toolSchemas = availableTools.map(t => ({
      type: 'function',
      function: t.schema
    }));

    // 3. Request Stream from Router
    const streamIterator = await streamChat({
      provider: provider || 'qwen',
      model,
      messages: fullMessages,
      tools: toolSchemas.length > 0 ? toolSchemas : undefined,
      thinkingLevel,
      anonymousToken: token,
    });

    // 4. Return as SSE
    return createEventStreamResponse(streamIterator);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
