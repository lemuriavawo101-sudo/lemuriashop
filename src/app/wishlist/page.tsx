"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import styles from './Wishlist.module.css';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className={styles.wishlistPage}>
      {/* Background Cinematic Elements */}
      <div className={styles.ambientGlow}></div>
      <div className={styles.noiseOverlay}></div>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleWrapper}>
            <span className={styles.subtitle}>PERSONAL COLLECTION</span>
            <h1 className={styles.title}>THE VAULT</h1>
            <div className={styles.divider}></div>
            <p className={styles.countSummary}>
              {wishlistCount} {wishlistCount === 1 ? 'ARTIFACT' : 'ARTIFACTS'} PRESERVED
            </p>
          </div>
          <Link href="/products" className={styles.backLink}>
            <span className={styles.arrow}>←</span> RETURN TO ARCHIVE
          </Link>
        </header>

        {wishlistItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.vaultIcon}>🔒</div>
            <h2 className={styles.emptyTitle}>YOUR VAULT IS VACANT</h2>
            <p className={styles.emptyText}>Explore the Lemuria Archive to preserve legendary artifacts in your personal collection.</p>
            <Link href="/products" className="btnPremium btnPremiumGold">
              BROWSE ARCHIVE
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlistItems.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.imageContainer}>
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <button 
                    className={styles.removeBtn}
                    onClick={() => removeFromWishlist(item.id)}
                    title="Remove from vault"
                  >
                    ×
                  </button>
                </div>
                
                <div className={styles.info}>
                  <div className={styles.category}>{item.category.toUpperCase()}</div>
                  <h3 className={styles.name}>{item.name.toUpperCase()}</h3>
                  <div className={styles.price}>₹{(item.price ?? 0).toLocaleString()}</div>
                  
                  <div className={styles.actions}>
                    <button 
                      className="btnPremium btnPremiumGold"
                      onClick={() => item.variants?.[0] && addToCart(item, item.variants[0])}
                    >
                      BUY
                    </button>
                    <Link href={`/products`} className={styles.detailsLink}>
                      VIEW DETAILS
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
