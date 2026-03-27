import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const usersPath = path.join(process.cwd(), 'src/data/users.json');
    const data = await fs.readFile(usersPath, 'utf8');
    const users = JSON.parse(data);

    // Simplistic check for demo - in production, use password hashing!
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      return NextResponse.json({ 
        success: true, 
        user: { name: user.name, email: user.email } 
      });
    }

    return NextResponse.json({ error: 'Invalid identification credentials' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Authentication system failure' }, { status: 500 });
  }
}
