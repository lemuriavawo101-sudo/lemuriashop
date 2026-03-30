const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function audit() {
  try {
    const res = await client.execute("SELECT id, name, image FROM products");
    console.log("=== Product Image Audit ===");
    res.rows.forEach(row => {
      const issues = [];
      if (!row.image) issues.push("MISSING PATH");
      else if (row.image.startsWith('http://localhost')) issues.push("HARDCODED LOCALHOST");
      else if (!row.image.startsWith('/') && !row.image.startsWith('http')) issues.push("MISSING LEADING SLASH");

      console.log(`[${row.id}] ${row.name.padEnd(20)} | Path: ${row.image.padEnd(40)} | Issues: ${issues.length ? issues.join(', ') : 'OK'}`);
    });
  } catch (err) {
    console.error("Audit failed:", err);
  } finally {
    client.close();
  }
}

audit();
