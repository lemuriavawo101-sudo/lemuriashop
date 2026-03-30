const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function sanitize() {
  try {
    const res = await client.execute("SELECT id, image FROM products");
    console.log(`=== Sanitizing ${res.rows.length} Image Paths ===`);
    
    for (const row of res.rows) {
      if (row.image && !row.image.startsWith('/') && !row.image.startsWith('http')) {
        const newPath = `/${row.image}`;
        console.log(`[ID:${row.id}] Updating: ${row.image} -> ${newPath}`);
        await client.execute({
          sql: "UPDATE products SET image = ? WHERE id = ?",
          args: [newPath, row.id]
        });
      }
    }
    console.log("Sanitization complete.");
  } catch (err) {
    console.error("Sanitization failed:", err);
  } finally {
    client.close();
  }
}

sanitize();
