import { NextRequest, NextResponse } from 'next/server';

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export async function POST(req: NextRequest) {
  try {
    const { context, thumbsUp, notes, system, timestamp } = await req.json();
    
    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          'Time Stamp': {
            type: 'date',
            date: { start: timestamp }
          },
          'System': {
            type: 'rich_text',
            rich_text: [{
              type: 'text',
              text: { content: system }
            }]
          },
          'Context': {
            type: 'rich_text',
            rich_text: [{
              type: 'text',
              text: { content: context }
            }]
          },
          'Thumbs Up': {
            type: 'checkbox',
            checkbox: thumbsUp
          },
          'Notes': {
            type: 'rich_text',
            rich_text: [{
              type: 'text',
              text: { content: notes || '' }
            }]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
} 