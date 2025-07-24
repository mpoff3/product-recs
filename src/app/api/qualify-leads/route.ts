import { NextRequest, NextResponse } from 'next/server';

const QUALIFY_LEADS_WEBHOOK_URL = process.env.QUALIFY_LEADS_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    // Check if webhook URL is configured
    if (!QUALIFY_LEADS_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    const body = await request.json();
    
    const response = await fetch(QUALIFY_LEADS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in qualify-leads API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch qualify leads results' },
      { status: 500 }
    );
  }
}