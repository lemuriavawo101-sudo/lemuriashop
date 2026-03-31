"use client";

import React, { useState, useEffect, useRef } from 'react';
import ProductGridCard from '@/app/products/ProductGridCard';
import styles from '@/app/products/Products.module.css';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  isWeapon: boolean;
  variants: any[];
  image: string;
  model3d?: string;
  rotation?: number;
  modelRotation?: number;
  modelRotationX?: number;
  modelRotationZ?: number;
  artifactType: string;
  avgRating?: number | null;
  reviewCount?: number;
}

interface ProductInfiniteListProps {
  initialProducts: Product[];
  totalCount: number;
  searchParams: any;
}

const ProductInfiniteList: React.FC<ProductInfiniteListProps> = ({ 
  initialProducts, 
  totalCount,
  searchParams 
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [offset, setOffset] = useState(initialProducts.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalCount);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset list if searchParams change (initialProducts will be different)
  useEffect(() => {
    setProducts(initialProducts);
    setOffset(initialProducts.length);
    setHasMore(initialProducts.length < totalCount);
  }, [initialProducts, totalCount]);

  const fetchMoreProducts = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/products?limit=12&offset=${offset}`);
      if (!response.ok) throw new Error('Failed to fetch batch');
      
      const newProducts = await response.json();
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setOffset(prev => prev + newProducts.length);
        setHasMore(products.length + newProducts.length < totalCount);
      }
    } catch (error) {
      console.error('Error fetching artifact batch:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMoreProducts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, offset, loading]);

  return (
    <>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className={styles.loadingTrigger}>
          <div className={styles.acquisitionLoader}>
            <div className={styles.loaderLine}></div>
            <span>LOADING MORE ARTIFACTS...</span>
          </div>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className={styles.endOfArchive}>
          <span>END OF ARCHIVE</span>
        </div>
      )}
    </>
  );
};

export default ProductInfiniteList;
