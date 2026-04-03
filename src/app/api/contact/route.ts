import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadToGithub } from '@/lib/github-vault';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    let sampleImageUrl = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      
      const file = formData.get('sampleImage') as File | null;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        sampleImageUrl = await uploadToGithub(buffer, fileName, 'enquiries');
      }
    } else {
      data = await request.json();
    }

    const id = `ENQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const date = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO enquiries (id, name, email, phone, subject, message, measurements, materials, status, date, sampleImage) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        date,
        sampleImageUrl || data.sampleImage || null
      ]
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: `Failed to save inquiry: ${error.message}` }, { status: 500 });
  }
}
