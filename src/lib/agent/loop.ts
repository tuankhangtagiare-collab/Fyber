import { useEffect, useRef } from 'react';
import { db } from '@/lib/storage/dexie';
import { useWorkspaceStore } from '@/lib/storage/store';
import { useLiveQuery } from 'dexie-react-hooks';

export function useAgentLoop() {
  const { activeSessionId } = useWorkspaceStore();
  const isProcessing = useRef(false);

  const messages = useLiveQuery(
    () => activeSessionId ? db.messages.where('sessionId').equals(activeSessionId).sortBy('createdAt') : [],
    [activeSessionId]
  );

  useEffect(() => {
    if (!activeSessionId || !messages || messages.length === 0 || isProcessing.current) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'user' && lastMsg.status === 'completed') {
      isProcessing.current = true;
      triggerAgentTurn(activeSessionId, messages).finally(() => {
        isProcessing.current = false;
      });
    }
  }, [messages, activeSessionId]);

  async function triggerAgentTurn(sessionId: string, history: any[]) {
    try {
      const session = await db.sessions.get(sessionId);
      if (!session) return;

      await db.sessions.update(sessionId, { executionState: 'running_tools' });

      const assistantMsgId = crypto.randomUUID();
      await db.messages.add({
        id: assistantMsgId,
        sessionId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        status: 'streaming'
      });

      // Prepare messages for API
      const apiMessages = history.map(m => ({
        role: m.role,
        content: m.content,
        tool_calls: m.toolCalls,
        tool_call_id: m.role === 'tool' ? m.id : undefined // Simplified mapping
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: session.provider,
          model: session.modelId,
          thinkingLevel: session.thinkingLevel,
          skillsEnabled: session.skillsEnabled,
          messages: apiMessages
        })
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reasoningBuffer = '';
      let contentBuffer = '';
      let toolCallsList: any[] = [];

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.type === 'error') {
                 contentBuffer += `\n\n**Error:** ${data.error}`;
                 await db.messages.update(assistantMsgId, { content: contentBuffer, status: 'error' });
                 return;
              }

              if (data.type === 'reasoning') {
                reasoningBuffer += data.content;
                await db.messages.update(assistantMsgId, { reasoningSummary: reasoningBuffer });
              }

              if (data.type === 'content') {
                contentBuffer += data.content;
                await db.messages.update(assistantMsgId, { content: contentBuffer });
              }

              if (data.type === 'tool_calls') {
                 // For now, we just store tool calls. 
                 // A real robust loop would execute them and recursively call triggerAgentTurn
                 data.tool_calls.forEach((tc: any) => {
                    toolCallsList.push({
                       id: tc.id || crypto.randomUUID(),
                       name: tc.function?.name || 'unknown',
                       args: tc.function?.arguments || '',
                       status: 'pending'
                    });
                 });
                 await db.messages.update(assistantMsgId, { toolCalls: [...toolCallsList] });
              }
            } catch(e) {
              console.error('JSON Parse error on SSE:', e);
            }
          }
        }
      }

      await db.messages.update(assistantMsgId, { status: 'completed' });
      await db.sessions.update(sessionId, { executionState: 'idle' });

      // If there are tool calls, we execute them and then trigger the loop again!
      if (toolCallsList.length > 0) {
        await handleToolExecution(sessionId, assistantMsgId, toolCallsList);
      }

    } catch (error: any) {
       console.error("Agent Loop Error:", error);
       await db.sessions.update(sessionId, { executionState: 'failed' });
    }
  }

  async function handleToolExecution(sessionId: string, assistantMsgId: string, toolCalls: any[]) {
     await db.sessions.update(sessionId, { executionState: 'running_tools' });
     
     // Note: Real implementations would execute the tool functions here via the ToolRegistry
     // and await user approval for tools that require it. For this version, we mark them successful.
     const results = toolCalls.map(tc => ({
         tool_call_id: tc.id,
         role: 'tool',
         name: tc.name,
         content: JSON.stringify({ success: true, message: `Executed ${tc.name}` })
     }));

     // Store the tool results as a single message block
     const toolMsgId = crypto.randomUUID();
     await db.messages.add({
         id: toolMsgId,
         sessionId,
         role: 'tool',
         content: JSON.stringify(results),
         createdAt: Date.now(),
         status: 'completed'
     });

     // Update tool call status in the assistant message
     await db.messages.update(assistantMsgId, {
         toolCalls: toolCalls.map(tc => ({ ...tc, status: 'success' }))
     });

     // Fetch full history and trigger agent again to evaluate tool results
     const history = await db.messages.where('sessionId').equals(sessionId).sortBy('createdAt');
     await triggerAgentTurn(sessionId, history);
  }
}
