import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM products');
    const products = result.rows;
    const variants = (await db.execute('SELECT * FROM variants')).rows;
    
    const enriched = products.map((p: any) => ({
      ...p,
      isWeapon: Boolean(p.isWeapon),
      variants: variants.filter((v: any) => v.productId === p.id)
    }));
    
    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: `Heritage Logic Error: ${error.message || 'Failed to fetch products'}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const p = await request.json();
    
    const result = await db.execute({
      sql: `INSERT INTO products (name, category, artifactType, description, isWeapon, image, model3d, rotation, modelRotation, modelRotationX, modelRotationZ, stock, showInCollection)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      args: [p.name, p.category, p.artifactType, p.description, p.isWeapon ? 1 : 0, p.image, p.model3d, p.rotation || 0, p.modelRotation || 0, p.modelRotationX || 0, p.modelRotationZ || 0, p.stock || 'In Stock', p.showInCollection !== undefined ? (p.showInCollection ? 1 : 0) : 1]
    });
    
    const productId = Number(result.rows[0].id);
    
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        await db.execute({
          sql: 'INSERT INTO variants (productId, size, price, old_price, stock, refillLevel) VALUES (?, ?, ?, ?, ?, ?)',
          args: [productId, v.size, v.price, v.old_price, v.stock, v.refillLevel]
        });
      }
    }
    
    return NextResponse.json({ ...p, id: productId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const p = await request.json();
    
    await db.execute({
      sql: `UPDATE products SET name=?, category=?, artifactType=?, description=?, isWeapon=?, image=?, model3d=?, rotation=?, modelRotation=?, modelRotationX=?, modelRotationZ=?, stock=?, showInCollection=?
            WHERE id = ?`,
      args: [p.name, p.category, p.artifactType, p.description, p.isWeapon ? 1 : 0, p.image, p.model3d, p.rotation, p.modelRotation, p.modelRotationX, p.modelRotationZ, p.stock, p.showInCollection ? 1 : 0, p.id]
    });
    
    // Update variants: simplify by delete and re-insert
    await db.execute({ sql: 'DELETE FROM variants WHERE productId = ?', args: [p.id] });
    for (const v of p.variants) {
      await db.execute({
        sql: 'INSERT INTO variants (productId, size, price, old_price, stock, refillLevel) VALUES (?, ?, ?, ?, ?, ?)',
        args: [p.id, v.size, v.price, v.old_price, v.stock, v.refillLevel]
      });
    }
    
    return NextResponse.json(p);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
