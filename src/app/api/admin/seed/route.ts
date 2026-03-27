import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const dataDir = path.join(process.cwd(), 'src/data');
    const seedDir = path.join(dataDir, 'seed');

    const filesToSeed = [
      'products.json',
      'deals.json',
      'reviews.json',
      'orders.json',
      'users.json'
    ];

    for (const file of filesToSeed) {
      const seedPath = path.join(seedDir, file);
      const targetPath = path.join(dataDir, file);

      if (fs.existsSync(seedPath)) {
        const data = fs.readFileSync(seedPath, 'utf8');
        fs.writeFileSync(targetPath, data);
      }
    }

    return NextResponse.json({ message: 'Archive successfully initialized with seed data' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed archive' }, { status: 500 });
  }
}
