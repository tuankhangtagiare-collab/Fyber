export async function* parseSSE(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      buffer = lines.pop() || ''; // Keep the last incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) {
          // Ignore empty lines and keepalive comments
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            return;
          }

          try {
            const data = JSON.parse(dataStr);
            yield data;
          } catch (e) {
            console.error('Error parsing SSE data:', dataStr, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function createEventStreamResponse(
  iterator: AsyncGenerator<any, void, unknown>,
  onClose?: () => void
): Response {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterator) {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
          );
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      } catch (e) {
        console.error('Streaming error:', e);
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Streaming interrupted' })}\n\n`)
        );
      } finally {
        controller.close();
        onClose?.();
      }
    },
    cancel() {
      onClose?.();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
