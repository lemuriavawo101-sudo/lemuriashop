const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function run() {
  const client = createClient({ url, authToken });
  try {
    console.log('Running migration: ALTER TABLE orders ADD COLUMN userId TEXT');
    await client.execute('ALTER TABLE orders ADD COLUMN userId TEXT');
    console.log('Success!');
  } catch (e) {
    console.log('Error or already exists:', e.message);
  }
}

run();
