"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Products.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { AnimatePresence } from 'framer-motion';
import CinematicViewer from '@/components/ModelViewer/CinematicViewer';
import { usePerformance } from '@/context/PerformanceContext';

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
  const { showToast } = useToast();
  const { isLowPower, webGLSupported } = usePerformance();
  const [selected3D, setSelected3D] = useState<Product | null>(null);
  const variant = product.variants?.[0];
  const itemInWishlist = isInWishlist(product.id);
  
  if (!variant) return null;
  
  const show3D = webGLSupported && !isLowPower;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/products/${product.id}`;
    const title = `Check out ${product.name} at Lemuria Heritage`;
    
    if (navigator.share) {
      navigator.share({
        title,
        text: product.description,
        url,
      }).catch(err => {
        console.error("Error sharing:", err);
      });
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    }
  };
  const mainImage = product.image || product.variants.find(v => v.image)?.image || '/placeholder-artifact.png';
  const hasVariantVisuals = product.variants.some(v => v.image);
  
  return (
    <>
      <Link href={`/products/${product.id}`} className={styles.gridCard}>
        <div className={styles.cardImage}>
          {hasVariantVisuals && (
            <div className={styles.variantIndicator} title="Multiple visual variants available">
              ✨
            </div>
          )}
          <div 
            className={styles.cardImageContainer}
            style={{ 
              transform: product.rotation ? `rotate(${product.rotation}deg) scale(0.9)` : 'none'
            }}
          >
            <Image 
              src={mainImage} 
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

          <button 
            className={styles.shareBtn}
            onClick={handleShare}
            title="Share Artifact"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
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
              {show3D ? '3D VIEW' : 'ENLARGE'}
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
            <div className={styles.cardPrice}>₹{(variant?.price ?? 0).toLocaleString()}</div>
            <button 
              className="btnPremium btnPremiumGold"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, variant);
              }}
            >
              Buy
            </button>
          </div>
        </div>
      </Link>

      <AnimatePresence>
        {selected3D && (
          <CinematicViewer 
            src={selected3D.model3d!} 
            name={selected3D.name} 
            image={selected3D.image}
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
