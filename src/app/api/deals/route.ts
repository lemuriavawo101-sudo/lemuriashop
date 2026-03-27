import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dealsPath = path.resolve(process.cwd(), 'src/data/deals.json');

function readDeals(): number[] {
  try {
    if (!fs.existsSync(dealsPath)) {
      fs.writeFileSync(dealsPath, '[]', 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(dealsPath, 'utf-8');
    return JSON.parse(raw) as number[];
  } catch (error) {
    console.error('[Deals API] Read Error:', error);
    return [];
  }
}

export async function GET() {
  const dealIds = readDeals();
  return NextResponse.json(dealIds);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids: number[] = body.ids;

    console.log('[Deals API] Attempting to save IDs:', ids);

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
    }
    if (ids.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 deals allowed' }, { status: 400 });
    }

    fs.writeFileSync(dealsPath, JSON.stringify(ids, null, 2), 'utf-8');
    console.log('[Deals API] Successfully saved to:', dealsPath);
    
    return NextResponse.json({ success: true, ids });
  } catch (error) {
    console.error('[Deals API] Save Error:', error);
    return NextResponse.json({ error: 'Failed to save deals' }, { status: 500 });
  }
}
