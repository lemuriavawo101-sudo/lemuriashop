"use client";

/**
 * 🏺 LEMURIA HERITAGE - COLLECTION RECONSTRUCTION (v14.0)
 * MECHANICAL CHRONOMETER MODEL - TABULA RASA
 * 
 * Features:
 * - Direct "Spotlight" Interaction (No Fisheye Drift)
 * - Binary 1.5x Hero Pop Snap (±0.51 Trigger)
 * - Industrial-Grade Spacing (10% Overlap / 252px Step)
 * - Symmetrical 50vw Screen-Center Anchoring
 */

import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, useSpring, MotionValue, animate } from 'framer-motion';
import styles from './Collection.module.css';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import CinematicViewer from '../ModelViewer/CinematicViewer';
import { usePerformance } from '@/context/PerformanceContext';
import { Heart, Share2, Box, Eye } from 'lucide-react';
import { trackViewerOpen } from '@/lib/analytics';

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
  showInCollection?: boolean;
}

/**
 * EXHIBITION CARD - THE MASTERPIECE VIEW
 */
const ExhibitionCard = memo(({ product, addToCart, onOpen3D, onViewProduct }: { 
  product: Product; 
  addToCart: (product: any, variant: any) => void; 
  onOpen3D: (product: Product) => void;
  onViewProduct: () => void;
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isLowPower, webGLSupported } = usePerformance();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const variant = product.variants[selectedVariant];
  const itemInWishlist = isInWishlist(product.id);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/products/${product.id}`;
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.description, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    }
  };
  
  const show3D = webGLSupported && !isLowPower;
  const isOutOfStock = product.stock === 'Out of Stock' || product.variants.every(v => v.stock <= 0);

  return (
    <div className={`${styles.kineticCard} ${isOutOfStock ? styles.outOfStockCard : ''}`}>
      <div className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className={styles.image}
            style={{ transform: `rotate(${product.rotation || 0}deg)` }}
            sizes="(max-width: 768px) 100vw, 33vw"
            draggable={false}
            priority={false}
          />
        </div>
        
        {isOutOfStock && <div className={styles.outOfStockBadge}>EXHAUSTED</div>}

        <button 
          className={`${styles.wishlistBtn} ${itemInWishlist ? styles.wishlistActive : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
        >
          <Heart 
            size={16} 
            fill={itemInWishlist ? "#BF953F" : "none"} 
            color={itemInWishlist ? "#BF953F" : "currentColor"} 
          />
        </button>

        <button className={styles.shareBtn} onClick={handleShare}>
           <Share2 size={16} />
        </button>

        {product.model3d && (
          <button className={styles.view3dBtn} onClick={(e) => { e.stopPropagation(); onOpen3D(product); }}>
            <Box size={14} style={{ marginRight: '6px' }} />
            <span>{show3D ? '3D VIEW' : 'ENLARGE'}</span>
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.tagLine}>{product.category.toUpperCase()}</div>
        <h3 className={styles.productName}>{product.name.toUpperCase()}</h3>
        <div className={styles.artifactTypeBadge}>{product.artifactType || "ARCHIVAL"}</div>
       
        <div className={styles.variants} onPointerDown={(e) => e.stopPropagation()}>
          {product.variants.map((v, i) => (
            <button 
              key={i}
              className={`${styles.variantPill} ${selectedVariant === i ? styles.variantPillActive : ''}`}
              onClick={(e) => { e.stopPropagation(); setSelectedVariant(i); }}
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

        <div className={styles.buttonRow}>
          <button 
            className="btnPremium btnPremiumGold"
            disabled={isOutOfStock}
            onClick={(e) => { e.stopPropagation(); if (!isOutOfStock) addToCart(product, variant); }}
            style={{ flex: 1 }}
          >
            {isOutOfStock ? 'OUT' : 'ACQUIRE'}
          </button>
          <button 
            className="btnPremium btnPremiumGlass"
            onClick={(e) => { e.stopPropagation(); onViewProduct(); }}
            style={{ flex: 1 }}
          >
            VIEW
          </button>
        </div>
      </div>
    </div>
  );
});

ExhibitionCard.displayName = 'ExhibitionCard';

/**
 * CHRONOMETER ITEM - VIRTUALIZED FRAGMENT
 */
const ChronometerItem = memo(({ item, idx, virtualIndex, VISUAL_STEP, products, addToCart, onOpen3D, onViewProduct, activeIndex, isMobile }: any) => {
  const router = useRouter();

  // Binary Step-Function Scaling: [idx-0.51, idx-0.5, idx, idx+0.5, idx+0.51] -> [0.8, 0.8, 1.3, 0.8, 0.8]
  const scale = useTransform(virtualIndex, 
    [idx - 0.51, idx - 0.5, idx, idx + 0.5, idx + 0.51], 
    [0.8, 0.8, 1.3, 0.8, 0.8]
  );

  const rotateY = useTransform(virtualIndex, [idx - 0.5, idx, idx + 0.5], [-35, 0, 35]);
  
  // High-Contrast Binary Opacity: Artifact only ignites inside the lens
  const opacity = useTransform(virtualIndex, 
    [idx - 0.51, idx - 0.5, idx, idx + 0.5, idx + 0.51], 
    isMobile ? [0.05, 0.05, 1, 0.05, 0.05] : [0.2, 0.2, 1, 0.2, 0.2]
  );

  // Advanced Depth-Z (Pop-out effect)
  const zIndexVal = useTransform(virtualIndex, (v: number) => Math.round(100 - Math.abs(idx - v) * 20));

  const isVisible = Math.abs(idx - activeIndex) <= 4;
  if (!isVisible) return <div style={{ flex: `0 0 ${VISUAL_STEP}px` }} />;

  return (
    <motion.div
      className={styles.motionCardWrapper}
      style={{
        flex: `0 0 ${VISUAL_STEP}px`,
        scale,
        rotateY,
        opacity,
        zIndex: zIndexVal,
      }}
    >
      {item._viewAll ? (
        <div className={styles.viewAllCard}>
          <div className={styles.viewAllContent}>
            <div className={styles.folderIcon} />
            <h3 className={styles.viewAllText}>ARCHIVE</h3>
            <button 
              className="btnPremium btnPremiumGold"
              onClick={() => router.push(`/products?cat=${products[0]?.category}`)}
            >
              EXPLORE
            </button>
          </div>
        </div>
      ) : (
        <ExhibitionCard
          product={item}
          addToCart={addToCart}
          onOpen3D={onOpen3D}
          onViewProduct={() => onViewProduct(item.id)}
        />
      )}
    </motion.div>
  );
});

ChronometerItem.displayName = 'ChronometerItem';

/**
 * THE DIAL - INDUSTRIAL PRECISION INSTRUMENT
 */
const Dial = ({ products }: { products: Product[] }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selected3D, setSelected3D] = useState<Product | null>(null);
  const [cardWidth, setCardWidth] = useState(280);
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayControls = useRef<any>(null);
  const autoPlayTimeout = useRef<any>(null);
  const isInteracting = useRef(false);
  
  const VISUAL_STEP = cardWidth * 0.9; 
  const totalWidth = (products.length - 1) * VISUAL_STEP;

  const startAutoMotion = (startFromCurrent: boolean = false) => {
    if (autoPlayControls.current) autoPlayControls.current.stop();
    if (products.length <= 1) return;

    const currentX = x.get();
    const targetX = currentX >= -10 ? -totalWidth : 0;
    const remainingDistance = Math.abs(targetX - currentX);
    const duration = (remainingDistance / VISUAL_STEP) * 6; // 6 seconds per artifact step

    autoPlayControls.current = animate(x, targetX, {
      duration: duration,
      ease: "linear",
      onComplete: () => {
        // Ping-pong reversal with delay
        autoPlayTimeout.current = setTimeout(() => startAutoMotion(), 2000);
      }
    });
  };

  useEffect(() => {
    // Initial start
    const timer = setTimeout(() => startAutoMotion(), 3000);
    return () => {
      clearTimeout(timer);
      if (autoPlayControls.current) autoPlayControls.current.stop();
      if (autoPlayTimeout.current) clearTimeout(autoPlayTimeout.current);
    };
  }, [products.length, totalWidth]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (window.innerWidth < 480) setCardWidth(240);
      else setCardWidth(280);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const x = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 400, damping: 45 });
  const virtualIndex = useTransform(xSpring, (val) => -val / VISUAL_STEP);
  const [activeIndex, setActiveIndex] = useState(0);

  const onDragStart = () => {
    isInteracting.current = true;
    if (autoPlayControls.current) autoPlayControls.current.stop();
    if (autoPlayTimeout.current) clearTimeout(autoPlayTimeout.current);
  };

  const onDragEnd = (event: any, info: any) => {
    isInteracting.current = false;
    const currentX = x.get();
    
    // Snapping logic
    const closestIndex = Math.round(Math.abs(currentX) / VISUAL_STEP);
    const snapX = -closestIndex * VISUAL_STEP;
    
    animate(x, snapX, {
      type: "spring",
      stiffness: 260,
      damping: 28,
      onComplete: () => {
        // Resume auto-motion after delay
        if (!isInteracting.current) {
          autoPlayTimeout.current = setTimeout(() => startAutoMotion(), 4000);
        }
      }
    });
  };

  const lastInteraction = useRef(Date.now());
  const allItems = useMemo(() => [...products, { id: -1, _viewAll: true } as any], [products]);

  useEffect(() => {
    return virtualIndex.on("change", (v) => { setActiveIndex(Math.round(v)); });
  }, [virtualIndex]);

  return (
    <div className={styles.kineticDialWrapper}>
      <div className={styles.watermarkContainer}>
        <h2 className={styles.bgWatermark}>LEMURIA</h2>
      </div>

      <motion.div 
        className={styles.kineticDialContainer}
        drag="x"
        style={{ x: xSpring }}
        dragElastic={0.1}
        dragConstraints={{ left: -(allItems.length - 1) * VISUAL_STEP, right: 0 }}
        dragTransition={{
          power: 0.15,
          timeConstant: 250,
          modifyTarget: (target) => Math.round(target / VISUAL_STEP) * VISUAL_STEP
        }}
        onPointerDown={() => { lastInteraction.current = Date.now(); x.stop(); }}
      >
        {allItems.map((item, idx) => (
          <ChronometerItem
            key={item.id === -1 ? 'view-all' : item.id}
            item={item}
            idx={idx}
            virtualIndex={virtualIndex}
            VISUAL_STEP={VISUAL_STEP}
            products={products}
            addToCart={addToCart}
            onOpen3D={(p: Product) => {
              trackViewerOpen(p.name);
              setSelected3D(p);
            }}
            onViewProduct={(id: number) => router.push(`/products/${id}`)}
            activeIndex={activeIndex}
            isMobile={isMobile}
          />
        ))}
      </motion.div>

      {selected3D && (
        <CinematicViewer
          src={selected3D.model3d!}
          name={selected3D.name}
          image={selected3D.image}
          modelRotation={selected3D.modelRotation}
          modelRotationX={selected3D.modelRotationX}
          modelRotationZ={selected3D.modelRotationZ}
          onClose={() => setSelected3D(null)}
        />
      )}
    </div>
  );
};

const Collection = ({ products }: { products: Product[] }) => {
  const router = useRouter();
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  return (
    <section id="collection" className={styles.collection}>
      <div className={styles.bgContainer}>
        <Image src="/images/landscape_bg.jpg" alt="" fill className={styles.bgImage} priority={false} />
      </div>
      <div className={styles.kineticAura}></div>
      <div className={styles.container}>
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category && p.showInCollection !== false);
          if (categoryProducts.length === 0) return null;

          return (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryHeaderTop}>
                  <div className={styles.headerInfo}>
                    <div className={styles.headerLabel}>ARCHIVAL SELECTION</div>
                    <h2 className={styles.kineticTitle}>{category.toUpperCase()}</h2>
                  </div>
                  <button className={styles.categoryViewAllBtn} onClick={() => router.push(`/products?cat=${category}`)}>
                    EXPLORE <span className={styles.smallArrow}>⟶</span>
                  </button>
                </div>
                <div className={styles.kineticLine}></div>
              </div>
              <Dial products={categoryProducts as Product[]} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Collection;
