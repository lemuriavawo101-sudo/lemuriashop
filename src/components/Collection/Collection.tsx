"use client";

import React, { useState, useRef, useEffect, memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Collection.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import CinematicViewer from '../ModelViewer/CinematicViewer';
import { usePerformance } from '@/context/PerformanceContext';

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

const ProductCard = memo(({ product, addToCart, onOpen3D, onClick, onViewProduct }: { 
  product: Product; 
  addToCart: (product: any, variant: any) => void; 
  onOpen3D: (product: Product) => void;
  onClick: () => void;
  onViewProduct: () => void;
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isLowPower, webGLSupported } = usePerformance();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const variant = product.variants[selectedVariant];
  const itemInWishlist = isInWishlist(product.id);

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
  
  const show3D = webGLSupported && !isLowPower;

  const getIcon = (category: string) => {
    if (category === "Weapons") return "⚔️";
    if (category === "Books") return "📜";
    if (category === "Decoration") return "🏺";
    if (category === "Attire") return "👘";
    return "🛡️";
  };

  const isOutOfStock = product.stock === 'Out of Stock' || (variant && variant.stock <= 0);
  const isAltTogetherOutOfStock = product.stock === 'Out of Stock' || (product.variants && product.variants.every(v => v.stock <= 0));

  // The card is now a 'dumb' receiver that the Dial component updates via refs
  return (
    <div 
      className={`${styles.kineticCard} ${isAltTogetherOutOfStock ? styles.outOfStockCard : ''}`} 
      ref={cardRef} 
      data-kinetic-card 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.imageWrapper}>
        {!imageError ? (
          <div 
            className={styles.imageContainer}
            style={{ 
              transform: product.rotation ? `rotate(${product.rotation}deg) scale(0.9)` : 'none'
            }}
          >
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className={`${styles.image} ${product.isWeapon ? styles.weaponImage : ''}`}
              sizes="(max-width: 768px) 100vw, 33vw"
              draggable={false}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className={styles.fallbackImage}>
            <span>{product.name[0]}</span>
          </div>
        )}
        
        {isAltTogetherOutOfStock && (
          <div className={styles.outOfStockBadge}>OUT OF STOCK</div>
        )}

        <button 
          className={`${styles.wishlistBtn} ${itemInWishlist ? styles.wishlistActive : ''}`}
          onMouseDown={(e) => e.stopPropagation()}
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
          onMouseDown={(e) => e.stopPropagation()}
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
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen3D(product);
            }}
          >
            <span>{show3D ? '3D VIEW' : 'ENLARGE'}</span>
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.tagLine}>{product.category.toUpperCase()}</div>
        <h3 className={styles.productName}>{product.name.toUpperCase()}</h3>
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
        
        <div className={styles.variants}>
          {product.variants.map((v, i) => (
            <button 
              key={i}
              className={`${styles.variantPill} ${selectedVariant === i ? styles.variantPillActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedVariant(i);
              }}
            >
              {v.size}
            </button>
          ))}
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceContainer}>
            <span className={styles.currency}>₹</span>
            <span className={styles.price}>{variant.price.toLocaleString()}</span>
          </div>
        </div>

        <button 
          className="btnPremium btnPremiumGold"
          disabled={isOutOfStock}
          onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isOutOfStock) addToCart(product, variant);
          }}
          style={{ width: '100%', marginTop: 'auto' }}
        >
          {isOutOfStock ? 'OUT OF STOCK' : 'ACQUIRE'} <span className={styles.arrow}>→</span>
        </button>

        <button 
          className="btnPremium btnPremiumGlass"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewProduct();
          }}
          style={{ width: '100%', marginTop: '12px' }}
        >
          VIEW PRODUCT <span className={styles.arrow}>→</span>
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

const Dial = ({ products }: { products: Product[] }) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const [selected3D, setSelected3D] = useState<Product | null>(null);
  
  // Kinetic State (Refs for zero re-render)
  const isDown = useRef(false);
  const isHovered = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const scrollFloat = useRef(0);
  const velocity = useRef(0);
  const dragDistance = useRef(0);
  const lastTime = useRef(Date.now());
  const rafId = useRef<number>(0);
  const isVisible = useRef(false);
  const lastInteractionTime = useRef(Date.now());
  const cardsCache = useRef<{el: HTMLElement, offsetLeft: number, width: number}[]>([]);
  const targetCenter = useRef<number | null>(null); // For smooth centering animation

  useEffect(() => {
    if (!dialRef.current) return;
    
    const container = dialRef.current;
    
    // 0. Remove scroll restoration as it causes a "snap" on page load
    // The user prefers the standard scroll behavior
    sessionStorage.removeItem('lastDialProductId');

    // 1. Setup Intersection Observer to hibernate the loop
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0 } // Wake up immediately on first pixel of scroll
    );
    observer.observe(container);

    // 2. Cache cards to avoid getBoundingClientRect in the loop
    const updateCache = () => {
      const cards = container.querySelectorAll('[data-kinetic-card]');
      cardsCache.current = Array.from(cards).map(card => ({
        el: card as HTMLElement,
        offsetLeft: (card as HTMLElement).offsetLeft,
        width: (card as HTMLElement).offsetWidth
      }));
      // Initialize scroll position on mount
      scrollFloat.current = container.scrollLeft;
    };
    updateCache();

    window.addEventListener('resize', updateCache);

    // Drift direction: 1 = right, -1 = left
    let driftDir = 1;

    const update = () => {
      if (!isVisible.current) {
        rafId.current = requestAnimationFrame(update);
        return;
      }

      const now = Date.now();
      const maxScroll = container.scrollWidth - container.clientWidth;
      const timeSinceLastInput = now - lastInteractionTime.current;

      if (!isDown.current) {
        if (targetCenter.current !== null) {
          // 1. Centering Animation
          const diff = targetCenter.current - scrollFloat.current;
          if (Math.abs(diff) < 0.5) {
            scrollFloat.current = targetCenter.current;
            targetCenter.current = null;
            velocity.current = 0;
          } else {
            scrollFloat.current += diff * 0.08;
            velocity.current = 0;
          }
          container.scrollLeft = scrollFloat.current;
        } else if (Math.abs(velocity.current) > 0.05) {
          // 2. Momentum
          scrollFloat.current += velocity.current;
          velocity.current *= 0.95;
          if (scrollFloat.current < 0) scrollFloat.current = 0;
          if (scrollFloat.current > maxScroll) scrollFloat.current = maxScroll;
          container.scrollLeft = scrollFloat.current;
        } else if (maxScroll > 0 && timeSinceLastInput > 2000) {
          // 3. Cinematic Drift — slow ping-pong sweep
          const speed = 0.5; // ~30px/sec at 60fps — gentle museum drift
          scrollFloat.current += speed * driftDir;

          if (scrollFloat.current >= maxScroll) {
            scrollFloat.current = maxScroll;
            driftDir = -1;
          } else if (scrollFloat.current <= 0) {
            scrollFloat.current = 0;
            driftDir = 1;
          }

          container.scrollLeft = scrollFloat.current;
        }
      } else {
        lastInteractionTime.current = now;
      }

      // 4. Optimized 3D Distortion using CACHED dimensions ONLY
      const containerWidth = cardsCache.current[0]?.width * 2 || 1200;
      const scrollPos = scrollFloat.current;
      const centerX = scrollPos + containerWidth / 2;

      cardsCache.current.forEach((card) => {
        const cardCenter = card.offsetLeft + card.width / 2;
        const distFromCenter = cardCenter - centerX;
        const maxDist = containerWidth / 2;
        
        const normalized = Math.max(-1, Math.min(1, distFromCenter / maxDist));
        const absDist = Math.abs(normalized);
        
        const scale = 1 - absDist * 0.15;
        const rotateY = normalized * -20;
        const translateZ = absDist * -150;
        const opacity = 1 - absDist * 0.6;
        
        card.el.style.transform = `
          perspective(1000px)
          scale(${scale})
          rotateY(${rotateY}deg)
          translateZ(${translateZ}px)
        `;
        card.el.style.opacity = opacity.toString();
      });

      rafId.current = requestAnimationFrame(update);
    };

    rafId.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
      window.removeEventListener('resize', updateCache);
    };
  }, []);

  const handleMouseEnter = () => { isHovered.current = true; };
  const handleMouseLeave = () => { isHovered.current = false; if (isDown.current) handleMouseUp(); };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    startX.current = e.pageX;
    dragDistance.current = 0;
    lastTime.current = Date.now();
    lastInteractionTime.current = Date.now();
    scrollLeft.current = dialRef.current?.scrollLeft || 0;
    scrollFloat.current = scrollLeft.current;
    velocity.current = 0;
    targetCenter.current = null;
    if (dialRef.current) dialRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (dialRef.current) dialRef.current.style.cursor = 'grab';
  };

  const handleDragUpdate = (clientX: number) => {
    if (!isDown.current || !dialRef.current) return;
    const x = clientX;
    const walk = (x - startX.current) * 1.5;
    dragDistance.current = Math.abs(x - startX.current);
    lastTime.current = Date.now();
    
    const oldScroll = scrollFloat.current;
    const targetScroll = scrollLeft.current - walk;
    
    dialRef.current.scrollLeft = targetScroll;
    scrollFloat.current = targetScroll;
    
    const instantVelocity = targetScroll - oldScroll;
    velocity.current = velocity.current * 0.4 + instantVelocity * 0.6;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragUpdate(e.pageX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDown.current = true;
    startX.current = e.touches[0].pageX;
    dragDistance.current = 0;
    lastTime.current = Date.now();
    lastInteractionTime.current = Date.now();
    scrollLeft.current = dialRef.current?.scrollLeft || 0;
    scrollFloat.current = scrollLeft.current;
    velocity.current = 0;
    targetCenter.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragUpdate(e.touches[0].pageX);
  };

  const handleTouchEnd = () => {
    isDown.current = false;
  };

  const handleCardClick = (index: number) => {
    // Prevent click if we dragged specifically (more than 5px)
    if (dragDistance.current > 5) return;
    
    // Prevent centering if we just finished a significant flick
    if (Math.abs(velocity.current) > 2) return;

    // Smoothly animate the clicked card to center via the kinetic loop
    if (!dialRef.current) return;
    const cards = dialRef.current.querySelectorAll('[data-kinetic-card]');
    const card = cards[index] as HTMLElement;
    if (!card) return;

    const containerWidth = dialRef.current.clientWidth;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const targetScrollPos = cardCenter - containerWidth / 2;

    // Set the target — the update loop will smoothly lerp toward it
    velocity.current = 0;
    targetCenter.current = targetScrollPos;
  };

  const handleViewProduct = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  return (
    <div className={styles.kineticDialWrapper}>
        <div 
          className={styles.kineticDialContainer} 
          ref={dialRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        <div className={styles.dialSpacer}></div>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            addToCart={addToCart} 
            onOpen3D={(p) => setSelected3D(p)}
            onClick={() => handleCardClick(products.indexOf(product))}
            onViewProduct={() => handleViewProduct(product.id)}
          />
        ))}
        <div className={styles.dialSpacer}></div>
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
    </div>
  );
};

const Collection = ({ products }: { products: Product[] }) => {
  const categories = React.useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  return (
    <section id="collection" className={styles.collection}>
      <div className={styles.bgContainer}>
        <Image 
          src="/images/landscape_bg.jpg" 
          alt="" 
          fill 
          className={styles.bgImage} 
          priority={false}
          loading="lazy" 
          sizes="100vw"
          quality={70}
        />
      </div>
      <div className={styles.kineticAura}></div>
      <div className={styles.container}>
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category);
          if (categoryProducts.length === 0) return null;

          return (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <div className={styles.headerLabel}>GALLERY SELECTION</div>
                <h2 className={styles.kineticTitle}>{category.toUpperCase()}</h2>
                <div className={styles.kineticLine}></div>
              </div>
              <Dial products={categoryProducts as Product[]} />
              
              <div className={styles.categoryFooter}>
                <button className={styles.viewAllBtn}>
                  EXPLORE {category.toUpperCase()} <span className={styles.smallArrow}>⟶</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Collection;
