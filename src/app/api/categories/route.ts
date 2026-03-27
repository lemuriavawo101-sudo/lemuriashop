import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'src/data/products.json');

async function getProducts() {
  const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveProducts(products: any[]) {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
}

export async function PUT(request: Request) {
  try {
    const { oldName, newName } = await request.json();
    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Missing category names' }, { status: 400 });
    }

    const products = await getProducts();
    let updatedCount = 0;

    const updatedProducts = products.map((p: any) => {
      if (p.category === oldName) {
        updatedCount++;
        return { ...p, category: newName };
      }
      return p;
    });

    await saveProducts(updatedProducts);
    
    return NextResponse.json({ message: `Successfully updated ${updatedCount} products` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rename category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { categoryName } = await request.json();
    if (!categoryName) {
      return NextResponse.json({ error: 'Missing category name' }, { status: 400 });
    }

    const products = await getProducts();
    let updatedCount = 0;

    const updatedProducts = products.map((p: any) => {
      if (p.category === categoryName) {
        updatedCount++;
        return { ...p, category: 'Uncategorized' };
      }
      return p;
    });

    await saveProducts(updatedProducts);
    
    return NextResponse.json({ 
      message: `Successfully removed category and reassigned ${updatedCount} products to Uncategorized` 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
