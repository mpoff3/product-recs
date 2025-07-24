import { NextRequest, NextResponse } from 'next/server';

const PRODUCT_CHAT_WEBHOOK_URL = process.env.PRODUCT_CHAT_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    if (!PRODUCT_CHAT_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    const body = await request.json();
    
    const response = await fetch(PRODUCT_CHAT_WEBHOOK_URL!, {
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
    console.error('Error in product-chat API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chatbot response' },
      { status: 500 }
    );
  }
} 