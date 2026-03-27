import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM orders ORDER BY date DESC');
    const orders = result.rows.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
      delivery: JSON.parse(o.delivery || '{}')
    }));
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const o = await request.json();
    const id = `ORD-${Date.now()}`;
    const date = new Date().toISOString();

    await db.execute({
      sql: 'INSERT INTO orders (id, customer, total, status, date, items, delivery) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, o.customer, o.total, 'Pending', date, JSON.stringify(o.items), JSON.stringify(o.delivery)]
    });

    return NextResponse.json({ ...o, id, date, status: 'Pending' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    await db.execute({
      sql: 'UPDATE orders SET status = ? WHERE id = ?',
      args: [status, id]
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await db.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
