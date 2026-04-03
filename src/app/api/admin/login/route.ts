import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // BOOTSTRAP FALLBACK: Priority check to allow access even if DB is unconfigured
    let token = process.env.ADMIN_SECRET_KEY || 'archival_fallback_token_v24';
    token = token.replace(/^["']|["']$/g, '');

    if (email === 'admin@lemuria.com' && password === 'admin') {
      console.log('ARCHIVE: EMERGENCY BOOTSTRAP ACCESS GRANTED');
      return NextResponse.json({ 
        success: true, 
        user: { name: 'Head Curator (Bootstrap)', email: 'admin@lemuria.com' },
        token: token
      });
    }

    // Secondary Check: Turso Database
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ? AND password = ? AND role = "admin"',
        args: [email, password]
      });

      if (result.rows.length > 0) {
        const user = result.rows[0];
        return NextResponse.json({ 
          success: true, 
          user: { name: user.name as string, email: user.email as string },
          token: token
        });
      }
    } catch (dbErr) {
      console.warn('ARCHIVE: DATABASE CONNECTION FAILURE - FALLING BACK TO SECURITY GATEWAY');
    }

    return NextResponse.json({ error: 'Invalid identification credentials' }, { status: 401 });
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Authentication system failure' }, { status: 500 });
  }
}
