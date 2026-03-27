import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();
    
    // 1. Check if user already exists in Turso
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists in the heritage archive' }, { status: 400 });
    }
    
    // 2. Create new user record
    const id = `USR-${Date.now()}`;
    await db.execute({
      sql: 'INSERT INTO users (id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, name, email, password, phone || '', 'user']
    });
    
    return NextResponse.json({ id, name, email, phone, role: 'user' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: `Registration failed: ${error.message}` }, { status: 500 });
  }
}
