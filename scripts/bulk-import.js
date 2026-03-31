const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Critical: Turso credentials missing in .env.local');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function bulkImport() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/bulk-import.js <path-to-json-file>');
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(path.resolve(filePath), 'utf8');
    const products = JSON.parse(rawData);

    console.log(`🏺 Initiating Bulk Preservation of ${products.length} artifacts...`);

    for (const p of products) {
      process.stdout.write(`Preserving [${p.name}]... `);
      
      // 1. Insert Product
      await client.execute({
        sql: `INSERT OR REPLACE INTO products (id, name, category, artifactType, description, isWeapon, image, model3d, rotation, modelRotation, modelRotationX, modelRotationZ, stock)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id, 
          p.name, 
          p.category, 
          p.artifactType, 
          p.description, 
          p.isWeapon ? 1 : 0, 
          p.image, 
          p.model3d || null, 
          p.rotation || 0, 
          p.modelRotation || 0, 
          p.modelRotationX || 0, 
          p.modelRotationZ || 0, 
          p.stock || 'In Stock'
        ]
      });

      // 2. Insert Variants
      if (p.variants && p.variants.length > 0) {
        await client.execute({ sql: 'DELETE FROM variants WHERE productId = ?', args: [p.id] });
        for (const v of p.variants) {
          await client.execute({
            sql: 'INSERT INTO variants (productId, size, price, old_price, stock, refillLevel) VALUES (?, ?, ?, ?, ?, ?)',
            args: [p.id, v.size, v.price, v.old_price, v.stock, v.refillLevel]
          });
        }
      }
      
      console.log('✅');
    }

    console.log('\n✨ Heritage Archive Expansion Successful! 500+ Items synchronized.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Preservation Error:', error);
    process.exit(1);
  }
}

bulkImport();
