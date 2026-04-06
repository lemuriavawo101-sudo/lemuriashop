"use client";

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './ProductSlider.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { usePerformance } from '@/context/PerformanceContext';

const CinematicViewer = dynamic(() => import('../ModelViewer/CinematicViewer'), { ssr: false });

interface Variant {
  size: string;
  price: number;
  old_price: number;
  stock: number;
  image?: string;
  model3d?: string;
  rotation?: number;
  modelRotation?: number;
  modelRotationX?: number;
  modelRotationZ?: number;
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
  const touchStartRef = useRef<number | null>(null);
  const [wasDragged, setWasDragged] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isLowPower, webGLSupported } = usePerformance();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product) return;

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
    if (isFocused) return; // Stop auto-rotate in focus mode
    
    const timer = setInterval(() => {
      handleNext();
    }, TIMER_DURATION);
    
    return () => clearInterval(timer);
  }, [currentIndex, products.length, isFocused]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
      setIsTransitioning(false);
      setIsFocused(false);
    }, 400);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
      setIsTransitioning(false);
      setIsFocused(false);
    }, 400);
  };

  const handleDragStart = (clientX: number) => {
    touchStartRef.current = clientX;
    setWasDragged(false);
  };

  const handleDragEnd = (clientX: number) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - clientX;
    
    if (Math.abs(diff) > 30) { // Lower threshold for high-precision swipe
      setWasDragged(true);
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartRef.current = null;
  };

  // Bridge touch events to drag handlers
  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => handleDragEnd(e.changedTouches[0].clientX);
  
  // Mouse Support for Universal "Momentum"
  const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const handleMouseUp = (e: React.MouseEvent) => handleDragEnd(e.clientX);

  if (products.length === 0) return null;

  const product = products[currentIndex];
  if (!product || !product.variants || product.variants.length === 0) return null;
  const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
  if (!selectedVariant) return null;
  const isProductCompletelyOutOfStock = product.stock === 'Out of Stock' || (product.variants && product.variants.every(v => v.stock <= 0));
  const isCurrentVariantOutOfStock = product.stock === 'Out of Stock' || selectedVariant.stock <= 0;
  const itemInWishlist = isInWishlist(product?.id);
  const show3D = webGLSupported && !isLowPower;

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
            <div 
              className={styles.timerWrapper}
              style={{ opacity: isFocused ? 0 : 1, pointerEvents: isFocused ? 'none' : 'auto' }}
            >
              <div key={currentIndex} className={styles.progressBar}></div>
            </div>
            <div className={styles.manualNav}>
              <button 
                className={styles.navBtn} 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFocused(false);
                  handlePrev();
                }}
              >←</button>
              <button 
                className={styles.navBtn} 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFocused(false);
                  handleNext();
                }}
              >→</button>
            </div>
          </div>
        </div>

        <div 
          className={`${styles.spotlightFrame} ${isTransitioning ? styles.fade : ''} ${isFocused ? styles.focused : ''}`}
          onClick={() => {
            if (!wasDragged) {
              setIsFocused(!isFocused);
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ cursor: isFocused ? 'default' : (wasDragged ? 'grabbing' : 'pointer') }}
        >
          {isFocused && (
            <button 
              className={styles.closeFocus}
              onClick={(e) => {
                e.stopPropagation();
                setIsFocused(false);
              }}
            >✕</button>
          )}
          <div className={styles.decorationTL}></div>
          <div className={styles.decorationTR}></div>
          <div className={styles.decorationBL}></div>
          <div className={styles.decorationBR}></div>
          
          <div className={styles.spotlightContent}>
            <div className={styles.mediaSide}>
              <div className={styles.imageWrapper}>
                {!imageError ? (
                  <Image 
                    src={product.image ? (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`) : '/placeholder_product.png'} 
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
                  <div className={styles.fallbackContainer}>
                    <img 
                      src={product.image?.startsWith('http') || product.image?.startsWith('/') ? product.image : `/${product.image}`}
                      alt={product.name}
                      className={styles.image}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        zIndex: 20
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className={styles.fallbackImage}>
                      <span>{product.name[0]}</span>
                    </div>
                  </div>
                )}
                <div className={styles.offerBadge}>
                  <span className={styles.offerLabel}>LIMITED OFFER</span>
                  <span className={styles.offerAmount}>-₹{((selectedVariant?.old_price || 0) - (selectedVariant?.price || 0)).toLocaleString()}</span>
                </div>

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

              {product.variants && product.variants.length > 0 && (
                <div className={styles.variantSelection}>
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
                  <div className={styles.priceValue}>₹{(selectedVariant?.price ?? 0).toLocaleString()}</div>
                </div>
                <div className={styles.oldPriceGroup}>
                  <div className={styles.oldPriceLabel}>ORIGINAL</div>
                  <div className={styles.oldPriceValue}>₹{(selectedVariant?.old_price ?? 0).toLocaleString()}</div>
                </div>
              </div>

              <div className={styles.actionArea}>
                <button 
                  disabled={isCurrentVariantOutOfStock}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isFocused) {
                      setIsFocused(true);
                    } else {
                      addToCart(product, selectedVariant);
                    }
                  }}
                  className={`btnPremium btnPremiumGold ${styles.addToCartBtn}`}
                >
                  {isCurrentVariantOutOfStock ? 'OUT OF STOCK' : (isFocused ? 'BUY ARTIFACT' : 'VIEW PRODUCT')} <span className={styles.arrow}>→</span>
                </button>
                {isFocused && (
                  <button 
                    className={styles.viewArchiveDetails}
                    onClick={(e) => {
                      e.stopPropagation();
                      sessionStorage.setItem('lastSliderIndex', currentIndex.toString());
                      router.push(`/products/${product.id}`);
                    }}
                  >
                    VIEW FULL HISTORY // LMR-{product.id}
                  </button>
                )}
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
          image={selected3D.image}
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
