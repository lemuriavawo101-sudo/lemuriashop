import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';

const DATA_DIR = path.join(process.cwd(), 'src/data');

export const getProducts = cache(async () => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'products.json'), 'utf8');
    const products = JSON.parse(data);
    
    // Enrich with ratings
    const reviews = await getReviews();
    return products.map((p: any) => {
      const pReviews = reviews.filter((r: any) => r.productId === p.id);
      const avgRating = pReviews.length > 0 
        ? pReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / pReviews.length 
        : null;
      return { ...p, avgRating, reviewCount: pReviews.length };
    });
  } catch (e) {
    console.error('getProducts error:', e);
    return [];
  }
});

export const getProductById = cache(async (id: number) => {
  const products = await getProducts();
  return products.find((p: any) => p.id === id) || null;
});

export const getDeals = cache(async () => {
  try {
    const products = await getProducts();
    const data = await fs.readFile(path.join(DATA_DIR, 'deals.json'), 'utf8');
    const dealIds = JSON.parse(data);
    
    if (dealIds.length > 0) {
      return products.filter((p: any) => dealIds.includes(p.id));
    }
    
    // Fallback: items with old prices
    return products.filter((p: any) => p.variants.some((v: any) => v.old_price > v.price));
  } catch (e) {
    console.error('getDeals error:', e);
    return [];
  }
});

export const getReviews = cache(async (productId?: number) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'reviews.json'), 'utf8');
    const reviews = JSON.parse(data);
    if (productId !== undefined) {
      return reviews.filter((r: any) => r.productId === productId);
    }
    return reviews;
  } catch (e) {
    return [];
  }
});

export const getOrders = cache(async () => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'orders.json'), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
});
