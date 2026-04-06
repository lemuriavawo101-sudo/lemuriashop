import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function listAllAssets() {
  try {
    console.log('--- ALL PRODUCT ASSETS ---');
    const pRes = await client.execute("SELECT id, name, image, model3d FROM products");
    pRes.rows.forEach(r => {
      console.log(`[${r.id}] ${r.name}: IMAGE=${r.image || 'NULL'}, MODEL=${r.model3d || 'NULL'}`);
    });

    console.log('\n--- ALL VARIANT ASSETS ---');
    const vRes = await client.execute("SELECT id, productId, size, image, model3d FROM variants");
    vRes.rows.forEach(r => {
      console.log(`[VAR-${r.id}] Product ${r.productId} (${r.size}): IMAGE=${r.image || 'NULL'}, MODEL=${r.model3d || 'NULL'}`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

listAllAssets();
