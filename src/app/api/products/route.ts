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

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    const products = await getProducts();
    
    // Simple ID generation
    const nextId = products.length > 0 ? Math.max(...products.map((p: any) => p.id)) + 1 : 1;
    const productWithId = { ...newProduct, id: nextId };
    
    products.push(productWithId);
    await saveProducts(products);
    
    return NextResponse.json(productWithId, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedProduct = await request.json();
    const products = await getProducts();
    
    const index = products.findIndex((p: any) => p.id === updatedProduct.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    products[index] = updatedProduct;
    await saveProducts(products);
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    let products = await getProducts();
    
    const initialLength = products.length;
    products = products.filter((p: any) => p.id !== id);
    
    if (products.length === initialLength) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    await saveProducts(products);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
