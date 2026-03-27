import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch all users from Turso heritage record
    const result = await db.execute('SELECT * FROM users');
    
    // 2. Remove passwords before sending to curator/client
    const users = result.rows.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role
    }));
    
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json({ error: `Heritage Logic Error: ${error.message}` }, { status: 500 });
  }
}
