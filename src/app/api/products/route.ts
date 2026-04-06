import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/data';
import { createClient } from '@libsql/client';
import { revalidatePath } from 'next/cache';
import { verifyCuratorToken, unauthorizedResponse } from '@/lib/admin-auth';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const products = await getProducts(limit, offset);
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Products cache error:', error);
    return NextResponse.json({ error: 'Failed to fetch heritage batch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { 
      name = 'Unnamed Artifact', 
      category = 'Uncategorized', 
      artifactType = 'Standard', 
      description = '', 
      isWeapon = false, 
      image = '', 
      model3d = null, 
      rotation = 0, 
      modelRotation = 0, 
      modelRotationX = 0, 
      modelRotationZ = 0, 
      stock = 'In Stock', 
      variants = [], 
      showInCollection = true 
    } = body;

    const result = await client.execute({
      sql: `INSERT INTO products (name, category, artifactType, description, isWeapon, image, model3d, rotation, modelRotation, modelRotationX, modelRotationZ, stock, showInCollection)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name, 
        category, 
        artifactType, 
        description, 
        isWeapon ? 1 : 0, 
        image || '', 
        model3d || null, 
        rotation || 0, 
        modelRotation || 0, 
        modelRotationX || 0, 
        modelRotationZ || 0, 
        stock || 'In Stock', 
        showInCollection !== false ? 1 : 0
      ]
    });

    const productId = Number(result.lastInsertRowid);

    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await client.execute({
          sql: 'INSERT INTO variants (productId, size, price, old_price, stock, refillLevel, image, model3d, rotation, modelRotation, modelRotationX, modelRotationZ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            productId, 
            v.size || 'Standard', 
            v.price || 0, 
            v.old_price || 0, 
            v.stock || 0, 
            v.refillLevel || 0, 
            v.image || null, 
            v.model3d || null,
            v.rotation || 0,
            v.modelRotation || 0,
            v.modelRotationX || 0,
            v.modelRotationZ || 0
          ]
        });
      }
    }

    revalidatePath('/');
    revalidatePath('/products');
    
    return NextResponse.json({ success: true, id: productId });
  } catch (error: any) {
    console.error('API POST Error:', error);
    return NextResponse.json({ error: `Archive Corruption: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { 
      id, 
      name, 
      category, 
      artifactType, 
      description, 
      isWeapon, 
      image, 
      model3d, 
      rotation, 
      modelRotation, 
      modelRotationX, 
      modelRotationZ, 
      stock, 
      variants, 
      showInCollection 
    } = body;

    if (!id) return NextResponse.json({ error: 'Missing artifact ID' }, { status: 400 });

    await client.execute({
      sql: `UPDATE products SET 
              name = ?, category = ?, artifactType = ?, description = ?, isWeapon = ?, 
              image = ?, model3d = ?, rotation = ?, modelRotation = ?, 
              modelRotationX = ?, modelRotationZ = ?, stock = ?, showInCollection = ?
            WHERE id = ?`,
      args: [
        name || 'Unnamed', 
        category || 'Standard', 
        artifactType || 'Standard', 
        description || '', 
        isWeapon ? 1 : 0, 
        image || '', 
        model3d || null, 
        rotation || 0, 
        modelRotation || 0, 
        modelRotationX || 0, 
        modelRotationZ || 0, 
        stock || 'In Stock', 
        showInCollection !== false ? 1 : 0, 
        id
      ]
    });

    // Update variants (rebuild approach)
    if (variants && Array.isArray(variants)) {
      await client.execute({ sql: 'DELETE FROM variants WHERE productId = ?', args: [id] });
      for (const v of variants) {
        await client.execute({
          sql: 'INSERT INTO variants (productId, size, price, old_price, stock, refillLevel, image, model3d, rotation, modelRotation, modelRotationX, modelRotationZ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            id, 
            v.size || 'Standard', 
            v.price || 0, 
            v.old_price || 0, 
            v.stock || 0, 
            v.refillLevel || 0, 
            v.image || null, 
            v.model3d || null,
            v.rotation || 0,
            v.modelRotation || 0,
            v.modelRotationX || 0,
            v.modelRotationZ || 0
          ]
        });
      }
    }
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!verifyCuratorToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing artifact ID' }, { status: 400 });

    await client.execute({ sql: 'DELETE FROM variants WHERE productId = ?', args: [id] });
    await client.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

