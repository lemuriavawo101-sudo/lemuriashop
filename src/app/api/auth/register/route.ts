import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'src/data/users.json');

async function getUsers() {
  const data = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveUsers(users: any[]) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();
    const users = await getUsers();
    
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    const newUser = {
      id: `USR-${Date.now()}`,
      name,
      email,
      password, // In a real app, hash this!
      phone,
      role: 'user'
    };
    
    users.push(newUser);
    await saveUsers(users);
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
