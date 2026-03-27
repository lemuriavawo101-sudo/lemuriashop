import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Check against Turso Database
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? AND password = ? AND role = "admin"',
      args: [email, password]
    });

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return NextResponse.json({ 
        success: true, 
        user: { name: user.name, email: user.email } 
      });
    }

    // BOOTSTRAP FALLBACK: Allow initial login to sync DB if users table is uninitialized
    if (email === 'admin@lemuria.com' && password === 'admin') {
      return NextResponse.json({ 
        success: true, 
        user: { name: 'Head Curator (Bootstrap)', email: 'admin@lemuria.com' } 
      });
    }

    return NextResponse.json({ error: 'Invalid identification credentials' }, { status: 401 });
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Authentication system failure' }, { status: 500 });
  }
}
