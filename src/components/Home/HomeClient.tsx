"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const ProductSlider = dynamic(() => import('@/components/ProductSlider/ProductSlider'), { 
  ssr: false,
  loading: () => <div style={{ minHeight: '400px', background: 'rgba(0,0,0,0.05)' }} />
});

const Collection = dynamic(() => import('@/components/Collection/Collection'), { 
  ssr: false,
  loading: () => <div style={{ minHeight: '800px', background: 'rgba(0,0,0,0.05)' }} />
});

interface HomeClientProps {
  allProducts: any[];
  dealProducts: any[];
}

export default function HomeClient({ allProducts, dealProducts }: HomeClientProps) {
  return (
    <>
      <ProductSlider products={dealProducts} />
      <Collection products={allProducts} />
    </>
  );
}
