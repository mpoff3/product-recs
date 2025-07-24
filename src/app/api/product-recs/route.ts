import { NextRequest, NextResponse } from 'next/server';

const PRODUCT_RECS_WEBHOOK_URL = process.env.PRODUCT_RECS_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    if (!PRODUCT_RECS_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
    }

    const body = await request.json();
    
    const response = await fetch(PRODUCT_RECS_WEBHOOK_URL!, {
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
    console.error('Error in product-recs API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product recommendations' },
      { status: 500 }
    );
  }
} 