import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function check() {
  try {
    const res = await client.execute('SELECT id, name, image FROM products LIMIT 5');
    console.log('--- PRODUCT IMAGES ---');
    res.rows.forEach(row => {
      console.log(`ID: ${row.id} | Name: ${row.name} | Image: ${row.image}`);
    });
    
    // Check GitHub settings
    console.log('\n--- GITHUB SETTINGS ---');
    console.log(`OWNER: ${process.env.GITHUB_OWNER}`);
    console.log(`REPO: ${process.env.GITHUB_REPO}`);
    console.log(`TOKEN: ${process.env.GITHUB_TOKEN ? 'PRESENT' : 'MISSING'}`);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
