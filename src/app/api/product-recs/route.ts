import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(process.env.PRODUCT_RECS_WEBHOOK_URL!, {
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