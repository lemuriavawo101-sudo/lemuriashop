import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'src/data/users.json');

async function getUsers() {
  const data = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const users = await getUsers();
    
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: 'Sign in failed' }, { status: 500 });
  }
}
