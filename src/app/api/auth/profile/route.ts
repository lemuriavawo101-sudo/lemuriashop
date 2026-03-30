import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing UID identification access' }, { status: 400 });
    }
    
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [uid]
    });
    
    if (result.rows.length === 0) {
      return NextResponse.json({ name: 'Member', role: 'member' });
    }
    
    const user = result.rows[0];
    return NextResponse.json({ 
      name: user.name, 
      role: user.role, 
      phone: user.phone || '' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to access profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { uid, email, name, phone } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Missing email identification access' }, { status: 400 });
    }
    
    // Upsert user profile in Turso
    // If uid is provided (authenticated), we link it. 
    // If not (lead capture), we use a placeholder or keep it null.
    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, role) 
            VALUES (?, ?, ?, ?, 'member') 
            ON CONFLICT(email) DO UPDATE SET 
            id = COALESCE(excluded.id, id),
            name = COALESCE(excluded.name, name),
            phone = COALESCE(excluded.phone, phone)`,
      args: [uid || `lead_${Date.now()}`, name || '', email, phone || '']
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Profile sync error:', error);
    return NextResponse.json({ error: 'Failed to synchronize heritage profile' }, { status: 500 });
  }
}
