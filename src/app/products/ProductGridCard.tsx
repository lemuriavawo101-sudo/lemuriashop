"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Products.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { AnimatePresence } from 'framer-motion';
import CinematicViewer from '@/components/ModelViewer/CinematicViewer';

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

const ProductGridCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selected3D, setSelected3D] = useState<Product | null>(null);
  const variant = product.variants[0];
  const itemInWishlist = isInWishlist(product.id);
  
  return (
    <>
      <Link href={`/products/${product.id}`} className={styles.gridCard}>
        <div className={styles.cardImage}>
          <div 
            className={styles.cardImageContainer}
            style={{ 
              transform: product.rotation ? `rotate(${product.rotation}deg) scale(0.9)` : 'none'
            }}
          >
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              draggable={false}
            />
          </div>
          <button 
            className={`${styles.wishlistBtn} ${itemInWishlist ? styles.wishlistActive : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            title={itemInWishlist ? "Removed from preservation" : "Preserve in Wishlist"}
          >
            <svg viewBox="0 0 24 24" fill={itemInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          {product.model3d && (
            <button 
              className={styles.view3dBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelected3D(product);
              }}
            >
              3D VIEW
            </button>
          )}
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardCategory}>{product.category.toUpperCase()} • {product.artifactType}</div>
          <h3 className={styles.cardName}>{product.name.toUpperCase()}</h3>
          <div className={styles.ratingRow}>
            {product.avgRating ? (
              <>
                <div className={styles.stars}>
                  {'★'.repeat(Math.floor(product.avgRating))}{'☆'.repeat(5 - Math.floor(product.avgRating))}
                </div>
                <span className={styles.reviewCount}>({product.reviewCount})</span>
              </>
            ) : (
              <span className={styles.unrated}>UNRATED</span>
            )}
          </div>
          <div className={styles.cardFooter}>
            <div className={styles.cardPrice}>₹{variant.price.toLocaleString()}</div>
            <button 
              className="btnPremium btnPremiumGold"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, variant);
              }}
              style={{ padding: '8px 20px', fontSize: '0.7rem' }}
            >
              Acquire
            </button>
          </div>
        </div>
      </Link>

      <AnimatePresence>
        {selected3D && (
          <CinematicViewer 
            src={selected3D.model3d!} 
            name={selected3D.name} 
            onClose={() => setSelected3D(null)}
            modelRotation={selected3D.modelRotation}
            modelRotationX={selected3D.modelRotationX}
            modelRotationZ={selected3D.modelRotationZ}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductGridCard;
