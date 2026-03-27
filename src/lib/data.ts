import { db } from './db';
import { cache } from 'react';

export const getProducts = cache(async () => {
  try {
    const result = await db.execute('SELECT * FROM products');
    const products = result.rows;
    
    // Fetch all variants and join in memory (efficient for small collections)
    const variantResult = await db.execute('SELECT * FROM variants');
    const allVariants = variantResult.rows;

    // Fetch all reviews for ratings
    const reviewResult = await db.execute('SELECT productId, rating FROM reviews');
    const allReviews = reviewResult.rows;

    return products.map((p: any) => {
      const pVariants = allVariants.filter((v: any) => v.productId === p.id);
      const pReviews = allReviews.filter((r: any) => r.productId === p.id);
      const avgRating = pReviews.length > 0 
        ? pReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / pReviews.length 
        : null;

      return {
        ...p,
        isWeapon: Boolean(p.isWeapon),
        variants: pVariants,
        avgRating,
        reviewCount: pReviews.length
      };
    });
  } catch (e) {
    console.error('getProducts DB error:', e);
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
    const result = await db.execute('SELECT productId FROM deals');
    const dealIds = result.rows.map((r: any) => r.productId);
    
    if (dealIds.length > 0) {
      return products.filter((p: any) => dealIds.includes(p.id));
    }
    
    // Fallback: items with old prices
    return products.filter((p: any) => p.variants.some((v: any) => v.old_price > v.price));
  } catch (e) {
    console.error('getDeals DB error:', e);
    return [];
  }
});

export const getReviews = cache(async (productId?: number) => {
  try {
    let result;
    if (productId !== undefined) {
      result = await db.execute({
        sql: 'SELECT * FROM reviews WHERE productId = ? ORDER BY date DESC',
        args: [productId]
      });
    } else {
      result = await db.execute('SELECT * FROM reviews ORDER BY date DESC');
    }
    return result.rows;
  } catch (e) {
    console.error('getReviews DB error:', e);
    return [];
  }
});

export const getOrders = cache(async () => {
  try {
    const result = await db.execute('SELECT * FROM orders ORDER BY date DESC');
    return result.rows.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
      delivery: JSON.parse(o.delivery || '{}')
    }));
  } catch (e) {
    console.error('getOrders DB error:', e);
    return [];
  }
});

export const getUsers = cache(async () => {
  try {
    const result = await db.execute('SELECT * FROM users');
    return result.rows;
  } catch (e) {
    return [];
  }
});
