import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCuratorToken, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // TEMPORARY MIGRATION: Add userId column if not exists
    try {
      await db.execute('ALTER TABLE orders ADD COLUMN userId TEXT;');
    } catch (e) {}

    let result;
    if (userId) {
      result = await db.execute({
        sql: 'SELECT * FROM orders WHERE userId = ? ORDER BY date DESC',
        args: [userId]
      });
    } else {
      result = await db.execute('SELECT * FROM orders ORDER BY date DESC');
    }

    const orders = result.rows.map((o: any) => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items,
      delivery: typeof o.delivery === 'string' ? JSON.parse(o.delivery || '{}') : o.delivery
    }));
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: `Heritage Logic Error: ${error.message || 'Failed to fetch orders'}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const o = await request.json();
    const id = o.id || `ORD-${Date.now()}`;
    const date = o.date || new Date().toISOString();
    const userId = o.userId || null;

    // Idempotency check
    const existing = await db.execute({
      sql: 'SELECT id FROM orders WHERE id = ?',
      args: [id]
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ ...o, status: 'Existing' }, { status: 200 });
    }

    await db.execute({
      sql: 'INSERT INTO orders (id, customer, total, status, date, items, delivery, userId, subtotal, tax, protectFee, shipping) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        id, 
        o.customer, 
        o.total, 
        'Paid', 
        date, 
        typeof o.items === 'string' ? o.items : JSON.stringify(o.items), 
        typeof o.delivery === 'string' ? o.delivery : JSON.stringify(o.delivery), 
        userId,
        o.subtotal || 0,
        o.tax || 0,
        o.protectFee || 0,
        o.shipping || 0
      ]
    });

    return NextResponse.json({ ...o, id, date, status: 'Pending' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to create order: ${error.message}` }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id, status } = await request.json();
    await db.execute({
      sql: 'UPDATE orders SET status = ? WHERE id = ?',
      args: [status, id]
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to update order: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await request.json();
    await db.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to delete order: ${error.message}` }, { status: 500 });
  }
}
