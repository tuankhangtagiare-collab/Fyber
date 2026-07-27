import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function getAnonymousToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get('fyber_anon_token')?.value;

  if (!token) {
    // Note: in a Route Handler, setting cookies directly inside a read might be restrictive depending on context.
    // If not found, we fallback to a random string or the client must initialize it.
    token = 'temp-' + uuidv4();
  }

  return token;
}
