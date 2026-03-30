import React, { Suspense } from 'react';
import Hero from '@/components/Hero/Hero';
import HomeClient from '@/components/Home/HomeClient';
import { getProducts, getDeals, getShowcaseItems } from '@/lib/data';

export const revalidate = 3600; // Revalidate every hour

async function AsyncHomeContents() {
  const [allProducts, dealProducts] = await Promise.all([
    getProducts(),
    getDeals()
  ]);

  return (
    <HomeClient 
      allProducts={allProducts as any} 
      dealProducts={dealProducts as any} 
    />
  );
}

export default async function Home() {
  const showcaseProducts = await getShowcaseItems();

  return (
    <main>
      <Hero products={showcaseProducts as any} />
      <Suspense fallback={<div style={{ height: '800px', width: '100%', background: 'transparent' }} />}>
        <AsyncHomeContents />
      </Suspense>
    </main>
  );
}
