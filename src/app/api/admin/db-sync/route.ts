import { NextResponse } from 'next/server';
import { initializeDatabase, migrateJsonToDb } from '@/lib/init-db';

export async function POST() {
  try {
    await initializeDatabase();
    await migrateJsonToDb();
    return NextResponse.json({ success: true, message: 'Heritage Database Synchronized' });
  } catch (error: any) {
    console.error('DB Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
