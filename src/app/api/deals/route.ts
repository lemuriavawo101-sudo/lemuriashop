import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.execute('SELECT productId FROM deals');
    const ids = result.rows.map((r: any) => r.productId);
    return NextResponse.json(ids);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { dealIds } = await request.json();
    
    // Replace all deals
    await db.execute('DELETE FROM deals');
    for (const id of dealIds) {
      await db.execute({
        sql: 'INSERT INTO deals (productId) VALUES (?)',
        args: [id]
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update deals' }, { status: 500 });
  }
}
