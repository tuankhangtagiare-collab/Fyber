import { streamQwenChat } from './qwen';
import { streamVenesusChat } from './venesus';

export interface RouterRequest {
  provider: 'qwen' | 'venesus';
  model: string;
  messages: any[];
  tools?: any[];
  thinkingLevel?: string;
  anonymousToken: string;
}

export async function streamChat(request: RouterRequest) {
  try {
    if (request.provider === 'venesus') {
      try {
        return await streamVenesusChat(request, request.anonymousToken);
      } catch (e: any) {
        if (e.message === 'QUOTA_EXCEEDED') {
          // Send a system message fallback if they hit quota
          return async function* () {
            yield { type: 'error', error: 'VenesusAI quota reached. Switch to Qwen or try later.' };
          }();
        }
        throw e;
      }
    } else {
      // Default to Qwen
      return await streamQwenChat(request);
    }
  } catch (error: any) {
    console.error('Provider Router Error:', error);
    return async function* () {
      yield { type: 'error', error: error.message || 'Unknown provider error occurred' };
    }();
  }
}
