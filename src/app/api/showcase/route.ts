import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.execute('SELECT productId FROM showcase');
    const ids = result.rows.map((r: any) => r.productId);
    return NextResponse.json(ids);
  } catch (error: any) {
    return NextResponse.json({ error: `Heritage Logic Error: ${error.message || 'Failed to fetch showcase'}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    const showcaseIds = ids || [];
    
    // Replace all showcase items
    await db.execute('DELETE FROM showcase');
    for (const id of showcaseIds) {
      await db.execute({
        sql: 'INSERT INTO showcase (productId) VALUES (?)',
        args: [id]
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to update showcase: ${error.message}` }, { status: 500 });
  }
}
