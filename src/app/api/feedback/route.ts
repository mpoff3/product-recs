import { NextRequest, NextResponse } from 'next/server';

const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/23894736/uubzgfb/';

export async function POST(req: NextRequest) {
  try {
    const { context, thumbsUp, notes, system, timestamp } = await req.json();
    const payload = {
      System: system || '',
      Context: context,
      'Thumbs Up': !!thumbsUp,
      Notes: notes || '',
      Timestamp: timestamp || '',
    };
    const zapierRes = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!zapierRes.ok) {
      const errorText = await zapierRes.text();
      return NextResponse.json({ error: errorText }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
} 