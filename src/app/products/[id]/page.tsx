import React from 'react';
import { notFound } from 'next/navigation';
import { getProductById, getReviews } from '@/lib/data';
import ProductDetailView from '@/app/components/ProductDetail/ProductDetailView';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(parseInt(id));
  
  if (!product) return { title: 'Not Found | Lemuria' };
  
  return {
    title: `${product.name} | Lemuria Heritage`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);
  
  const [product, reviews] = await Promise.all([
    getProductById(productId),
    getReviews(productId)
  ]);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} initialReviews={reviews} />;
}
