import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = process.env.USER_FEEDBACK_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  try {
    // Check if webhook URL is configured
    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    const { context, thumbsUp, notes, system, timestamp } = await req.json();
    const payload = {
      System: system || '',
      Context: context,
      'Thumbs Up': !!thumbsUp,
      Notes: notes || '',
      Timestamp: timestamp || '',
    };
    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!n8nRes.ok) {
      const errorText = await n8nRes.text();
      return NextResponse.json({ error: errorText }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
} 