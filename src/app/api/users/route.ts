import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'src/data/users.json');

async function getUsers() {
  const data = await fs.readFile(USERS_FILE, 'utf8');
  const users = JSON.parse(data);
  // Remove passwords before sending to client
  return users.map(({ password, ...userWithoutPassword }: any) => userWithoutPassword);
}

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
