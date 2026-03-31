import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCuratorToken, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const result = await db.execute('SELECT * FROM enquiries ORDER BY date DESC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: `Heritage Logic Error: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await request.json();
    if (!id) throw new Error('Inquiry ID required for archival removal');
    
    await db.execute({
      sql: 'DELETE FROM enquiries WHERE id = ?',
      args: [id]
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) throw new Error('Inquiry ID and status required for update');
    
    await db.execute({
      sql: 'UPDATE enquiries SET status = ? WHERE id = ?',
      args: [status, id]
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
