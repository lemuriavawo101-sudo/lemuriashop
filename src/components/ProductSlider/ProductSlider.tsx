"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './ProductSlider.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import CinematicViewer from '../ModelViewer/CinematicViewer';

interface Variant {
  size: string;
  price: number;
  old_price: number;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  isWeapon: boolean;
  variants: Variant[];
  image: string;
  model3d?: string;
  rotation?: number;
  modelRotation?: number;
  modelRotationX?: number;
  modelRotationZ?: number;
  artifactType: string;
  stock: 'In Stock' | 'Out of Stock';
  avgRating?: number | null;
  reviewCount?: number;
}

const ProductSlider = ({ products }: { products: Product[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selected3D, setSelected3D] = useState<Product | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const TIMER_DURATION = 7000;
  
  useEffect(() => {
    const savedIndex = sessionStorage.getItem('lastSliderIndex');
    if (savedIndex !== null && !isNaN(Number(savedIndex))) {
      const idx = Number(savedIndex);
      if (idx >= 0 && idx < products.length) {
        setCurrentIndex(idx);
      }
    }
  }, [products.length]);

  useEffect(() => {
    setSelectedVariantIndex(0); // Reset variant when product changes
    setImageError(false);
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, TIMER_DURATION);
    
    return () => clearInterval(timer);
  }, [currentIndex, products.length]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
      setIsTransitioning(false);
    }, 600);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
      setIsTransitioning(false);
    }, 600);
  };

  if (products.length === 0) return null;

  const product = products[currentIndex];
  const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const isProductCompletelyOutOfStock = product.stock === 'Out of Stock' || (product.variants && product.variants.every(v => v.stock <= 0));
  const isCurrentVariantOutOfStock = product.stock === 'Out of Stock' || selectedVariant.stock <= 0;
  const itemInWishlist = isInWishlist(product?.id);

  const getIcon = (category: string) => {
    if (category === "Weapons") return "⚔️";
    if (category === "Books") return "📜";
    if (category === "Decoration") return "🏺";
    if (category === "Attire") return "👘";
    return "🛡️";
  };

  return (
    <section className={styles.sliderSection}>
      <div className={styles.ambientGlowPrimary}></div>
      <div className={styles.filmGrain}></div>
      
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.badge}>EXCLUSIVE SPOTLIGHT // MISSION 2026</span>
            <h2 className={styles.sectionTitle}>DEAL OF THE MOMENT</h2>
          </div>
          <div className={styles.controlArea}>
            <div className={styles.timerWrapper}>
              <div key={currentIndex} className={styles.progressBar}></div>
            </div>
            <div className={styles.manualNav}>
              <button className={styles.navBtn} onClick={handlePrev}>←</button>
              <button className={styles.navBtn} onClick={handleNext}>→</button>
            </div>
          </div>
        </div>

        <div 
          className={`${styles.spotlightFrame} ${isTransitioning ? styles.fade : ''}`}
          onClick={() => {
            sessionStorage.setItem('lastSliderIndex', currentIndex.toString());
            router.push(`/products/${product.id}`);
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.decorationTL}></div>
          <div className={styles.decorationTR}></div>
          <div className={styles.decorationBL}></div>
          <div className={styles.decorationBR}></div>
          
          <div className={styles.spotlightContent}>
            <div className={styles.mediaSide}>
              <div className={styles.imageWrapper}>
                {!imageError ? (
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className={`${styles.image} ${product.isWeapon ? styles.weaponImage : ''}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    onError={() => setImageError(true)}
                    style={{ 
                      transform: product.rotation ? `rotate(${product.rotation}deg)` : 'none'
                    }}
                  />
                ) : (
                  <div className={styles.fallbackImage}>
                    <span>{product.name[0]}</span>
                  </div>
                )}
                <div className={styles.offerBadge}>
                  <span className={styles.offerLabel}>LIMITED OFFER</span>
                  <span className={styles.offerAmount}>-₹{(selectedVariant.old_price - selectedVariant.price).toLocaleString()}</span>
                </div>

                {product.model3d && (
                  <div className={styles.actionButtons}>
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
                      className={styles.view3dBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelected3D(product);
                      }}
                    >
                      3D VIEW
                    </button>
                  </div>
                )}

                {isProductCompletelyOutOfStock && (
                  <div className={styles.outOfStockBadge}>OUT OF STOCK</div>
                )}
              </div>
            </div>

            <div className={styles.infoSide}>
              <div className={styles.categoryInfo}>
                <div className={styles.iconBox}>
                  <span className={styles.icon}>{getIcon(product.category)}</span>
                </div>
                <span className={styles.categoryName}>{product.category}</span>
              </div>

              <h3 className={styles.productName}>{product.name.toUpperCase()}</h3>
              <div className={styles.ratingRow}>
                {product.avgRating ? (
                  <>
                    <div className={styles.stars}>
                      {'★'.repeat(Math.floor(product.avgRating))}{'☆'.repeat(5 - Math.floor(product.avgRating))}
                    </div>
                    <span className={styles.reviewCount}>({product.reviewCount} practitioner reviews)</span>
                  </>
                ) : (
                  <span className={styles.unrated}>UNRATED</span>
                )}
              </div>
              <p className={styles.description}>{product.description}</p>

              {product.variants.length > 1 && (
                <div className={styles.variantSelection}>
                  <span className={styles.variantLabel}>SIZE:</span>
                  <div className={styles.variantButtons}>
                    {product.variants.map((v, idx) => (
                      <button 
                        key={idx}
                        className={`${styles.variantBtn} ${selectedVariantIndex === idx ? styles.active : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedVariantIndex(idx);
                        }}
                        disabled={v.stock <= 0}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.pricing}>
                <div className={styles.priceGroup}>
                  <div className={styles.priceLabel}>HERITAGE PRICE</div>
                  <div className={styles.priceValue}>₹{selectedVariant.price.toLocaleString()}</div>
                </div>
                <div className={styles.oldPriceGroup}>
                  <div className={styles.oldPriceLabel}>ORIGINAL</div>
                  <div className={styles.oldPriceValue}>₹{selectedVariant.old_price.toLocaleString()}</div>
                </div>
              </div>

              <div className={styles.actionArea}>
                <button 
                  className="btnPremium btnPremiumGold" 
                  disabled={isCurrentVariantOutOfStock}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product, selectedVariant);
                  }}
                  style={{ minWidth: '280px' }}
                >
                  {isCurrentVariantOutOfStock ? 'OUT OF STOCK' : 'ACQUIRE ARTIFACT'} <span className={styles.arrow}>→</span>
                </button>
                <div className={styles.technicalNote}>LMR // UNIT-0{currentIndex + 1} // AUTHENTIC</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </section>
  );
};

export default ProductSlider;
