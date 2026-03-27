import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'src/data/orders.json');

async function getOrders() {
  const data = await fs.readFile(ORDERS_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveOrders(orders: any[]) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    const orders = await getOrders();
    
    const index = orders.findIndex((o: any) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    orders[index].status = status;
    await saveOrders(orders);
    
    return NextResponse.json(orders[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    const orders = await getOrders();
    
    // 1. Save the new order
    orders.unshift(newOrder);
    await saveOrders(orders);

    // 2. Automatically deplete stock in products.json
    const productsPath = path.join(process.cwd(), 'src/data/products.json');
    const productsData = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    let stockUpdated = false;
    if (newOrder.items && Array.isArray(newOrder.items)) {
      newOrder.items.forEach((orderedItem: any) => {
        const productIndex = products.findIndex((p: any) => p.id === orderedItem.productId);
        if (productIndex !== -1) {
          const product = products[productIndex];
          const variantIndex = product.variants.findIndex((v: any) => v.size === orderedItem.variantSize);
          
          if (variantIndex !== -1) {
            const currentStock = product.variants[variantIndex].stock || 0;
            product.variants[variantIndex].stock = Math.max(0, currentStock - (orderedItem.quantity || 1));
            stockUpdated = true;
          }
        }
      });
    }

    if (stockUpdated) {
      await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf8');
    }
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Order/Stock error:', error);
    return NextResponse.json({ error: 'Failed to process order and update stock' }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const orders = await getOrders();
    
    const filteredOrders = orders.filter((o: any) => o.id !== id);
    if (orders.length === filteredOrders.length) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    await saveOrders(filteredOrders);
    return NextResponse.json({ message: 'Order removed from archive' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
