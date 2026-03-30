import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. Ensure userId column exists on orders table just in case
    try {
      await db.execute('ALTER TABLE orders ADD COLUMN userId TEXT;');
    } catch (e) {
      // Column probably exists, ignore
    }

    // 2. We want to update all orders where userId is NULL or empty
    // We match by checking if the order.customer string matches a user.name exactly (case-insensitive usually handled by sqlite depending on collation, but we'll try straight match)
    
    // SQLite doesn't support complex UPDATE FROM with JOIN easily in older versions, 
    // but turso's libSQL supports standard modern SQLite.
    
    // Safe approach: Fetch orphaned orders and all users, do matching in JS if needed,
    // or do a direct UPDATE query. We'll use a direct UPDATE statement where possible, 
    // or fetch and batch update for safety.

    // Let's get all users
    const usersResult = await db.execute('SELECT id, name, email FROM users');
    const users = usersResult.rows;

    if (users.length === 0) {
      return NextResponse.json({ updated: 0, message: "No registered users found." });
    }

    // Let's get all orphaned orders
    const orphansResult = await db.execute('SELECT id, customer FROM orders WHERE userId IS NULL OR userId = ""');
    const orphans = orphansResult.rows;

    let updateCount = 0;

    for (const order of orphans) {
      if (!order.customer) continue;

      const orderCustomerName = String(order.customer).toLowerCase().trim();
      
      // Find matching user
      const matchingUser = users.find((u: any) => {
        const uName = u.name ? String(u.name).toLowerCase().trim() : '';
        const uEmail = u.email ? String(u.email).toLowerCase().trim() : '';
        return uName === orderCustomerName || uEmail === orderCustomerName;
      });

      if (matchingUser) {
        await db.execute({
          sql: 'UPDATE orders SET userId = ? WHERE id = ?',
          args: [matchingUser.id, order.id]
        });
        updateCount++;
      }
    }

    return NextResponse.json({ success: true, updated: updateCount });

  } catch (error: any) {
    console.error("Backfill error:", error);
    return NextResponse.json({ error: `Heritage Logic Error: ${error.message || 'Failed to cleanse archive'}` }, { status: 500 });
  }
}
