import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const id = `ENQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const date = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO enquiries (id, name, email, phone, subject, message, measurements, materials, status, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, 
        data.name, 
        data.email, 
        data.phone || null, 
        data.subject || 'general', 
        data.message, 
        data.measurements || null, 
        data.materials || null, 
        'New', 
        date
      ]
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: `Failed to save inquiry: ${error.message}` }, { status: 500 });
  }
}
