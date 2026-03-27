import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // 1. Validate credentials against Turso
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? AND password = ?',
      args: [email, password]
    });
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid identification credentials' }, { status: 401 });
    }
    
    const user = result.rows[0];
    
    // 2. Return plain user object (without password)
    return NextResponse.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      phone: user.phone || '', 
      role: user.role 
    });
  } catch (error: any) {
    console.error('Sign-in Error:', error);
    return NextResponse.json({ error: `Authentication failed: ${error.message}` }, { status: 500 });
  }
}
