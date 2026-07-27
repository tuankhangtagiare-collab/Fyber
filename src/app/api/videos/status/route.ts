import { NextRequest } from 'next/server';

const QWEN_API_KEY = process.env.QWEN_API_KEY || '';
const BASE_URL = 'https://qwen38-api-production.up.railway.app/v1';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticket = searchParams.get('ticket');

    if (!ticket) {
      return new Response(JSON.stringify({ error: 'Missing ticket' }), { status: 400 });
    }
    
    const response = await fetch(`${BASE_URL}/videos/status?ticket=${ticket}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(JSON.stringify({ error: `Qwen Video Status Error: ${text}` }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Video Status API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
