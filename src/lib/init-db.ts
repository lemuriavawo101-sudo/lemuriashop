import { db } from './db';
import fs from 'fs/promises';
import path from 'path';

export async function initializeDatabase() {
  console.log('Initializing Heritage Database Schema...');

  const schema = [
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      artifactType TEXT,
      description TEXT,
      isWeapon BOOLEAN,
      image TEXT,
      model3d TEXT,
      rotation REAL,
      modelRotation REAL,
      modelRotationX REAL,
      modelRotationZ REAL,
      stock TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER,
      size TEXT,
      price REAL,
      old_price REAL,
      stock INTEGER,
      refillLevel INTEGER,
      FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      productId INTEGER,
      userName TEXT,
      userEmail TEXT,
      rating INTEGER,
      comment TEXT,
      date TEXT,
      FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS deals (
      productId INTEGER PRIMARY KEY,
      FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer TEXT,
      total REAL,
      status TEXT,
      date TEXT,
      items TEXT,
      delivery TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      role TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT,
      measurements TEXT,
      materials TEXT,
      status TEXT DEFAULT 'New',
      date TEXT
    )`
  ];

  for (const statement of schema) {
    await db.execute(statement);
  }
  
  console.log('Schema synchronized. Beginning Data Migration...');
}

export async function migrateJsonToDb() {
  const DATA_DIR = path.join(process.cwd(), 'src/data');

  // Helper to read JSON
  const readJson = async (file: string) => {
    try {
      const content = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  };

  // 1. Migrate Products & Variants
  const products = await readJson('products.json');
  for (const p of products) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO products (id, name, category, artifactType, description, isWeapon, image, model3d, rotation, modelRotation, modelRotationX, modelRotationZ, stock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.name, p.category, p.artifactType, p.description, p.isWeapon ? 1 : 0, p.image, p.model3d || null, p.rotation || 0, p.modelRotation || 0, p.modelRotationX || 0, p.modelRotationZ || 0, p.stock || 'In Stock']
    });

    // Clear old variants for this product
    await db.execute({ sql: 'DELETE FROM variants WHERE productId = ?', args: [p.id] });
    for (const v of p.variants) {
      await db.execute({
        sql: 'INSERT INTO variants (productId, size, price, old_price, stock, refillLevel) VALUES (?, ?, ?, ?, ?, ?)',
        args: [p.id, v.size, v.price, v.old_price, v.stock, v.refillLevel]
      });
    }
  }

  // 2. Migrate Reviews
  const reviews = await readJson('reviews.json');
  for (const r of reviews) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO reviews (id, productId, userName, userEmail, rating, comment, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [r.id || `REV-${Date.now()}-${Math.random()}`, r.productId, r.userName, r.userEmail, r.rating, r.comment, r.date]
    });
  }

  // 3. Migrate Deals
  const dealIds = await readJson('deals.json');
  await db.execute('DELETE FROM deals');
  for (const id of dealIds) {
    await db.execute({ sql: 'INSERT OR IGNORE INTO deals (productId) VALUES (?)', args: [id] });
  }

  // 4. Migrate Users
  const users = await readJson('users.json');
  for (const u of users) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO users (id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      args: [u.id, u.name, u.email, u.password, u.phone || '', u.role || 'user']
    });
  }

  // 5. Migrate Orders
  const orders = await readJson('orders.json');
  for (const o of orders) {
    await db.execute({
      sql: 'INSERT OR REPLACE INTO orders (id, customer, total, status, date, items, delivery) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [o.id, o.customer, o.total, o.status, o.date, JSON.stringify(o.items), JSON.stringify(o.delivery)]
    });
  }

  console.log('Migration complete. Turso database is now the source of truth.');
}
