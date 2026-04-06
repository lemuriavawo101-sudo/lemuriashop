import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCuratorToken, unauthorizedResponse } from '@/lib/admin-auth';

export async function POST(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const enqInfo: any = await db.execute('PRAGMA table_info(enquiries)');
    const enqCols = enqInfo.rows.map((r: any) => r.name);
    
    if (!enqCols.includes('sampleImage')) {
      await db.execute('ALTER TABLE enquiries ADD COLUMN sampleImage TEXT');
    }

    const varInfo: any = await db.execute('PRAGMA table_info(variants)');
    const varCols = varInfo.rows.map((r: any) => r.name);
    
    if (!varCols.includes('image')) {
      await db.execute('ALTER TABLE variants ADD COLUMN image TEXT');
    }
    
    if (!varCols.includes('model3d')) {
      await db.execute('ALTER TABLE variants ADD COLUMN model3d TEXT');
    }

    const rotationCols = ['rotation', 'modelRotation', 'modelRotationX', 'modelRotationZ'];
    for (const col of rotationCols) {
      if (!varCols.includes(col)) {
        await db.execute(`ALTER TABLE variants ADD COLUMN ${col} REAL DEFAULT 0`);
      }
    }
    
    return NextResponse.json({ success: true, message: 'Archive Restored: enquiries and variants tables are synced.' });
  } catch (error: any) {
    console.error('Migration Error:', error);
    return NextResponse.json({ error: `Archive Corruption: ${error.message}` }, { status: 500 });
  }
}
