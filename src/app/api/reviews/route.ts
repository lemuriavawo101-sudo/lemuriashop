import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let result;
    if (productId) {
      result = await db.execute({
        sql: 'SELECT * FROM reviews WHERE productId = ? ORDER BY date DESC',
        args: [Number(productId)]
      });
    } else {
      result = await db.execute('SELECT * FROM reviews ORDER BY date DESC');
    }
    
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: `Heritage Logic Error: ${error.message || 'Failed to fetch reviews'}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const r = await request.json();
    const id = `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const date = new Date().toISOString();

    await db.execute({
      sql: 'INSERT INTO reviews (id, productId, userName, userEmail, rating, comment, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, r.productId, r.userName, r.userEmail, r.rating, r.comment, date]
    });

    return NextResponse.json({ ...r, id, date });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to post review: ${error.message}` }, { status: 500 });
  }
}
