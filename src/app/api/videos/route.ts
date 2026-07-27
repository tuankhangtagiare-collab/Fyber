import { NextRequest } from 'next/server';

const QWEN_API_KEY = process.env.QWEN_API_KEY || '';
const BASE_URL = 'https://qwen38-api-production.up.railway.app/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Video generation uses 'qwen-wan'. Returns a ticket for async polling.
    const response = await fetch(`${BASE_URL}/videos/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(JSON.stringify({ error: `Qwen Video API Error: ${text}` }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Video API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
