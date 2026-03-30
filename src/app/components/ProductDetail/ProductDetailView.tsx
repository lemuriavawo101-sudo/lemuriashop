"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiShoppingBag, FiMaximize2, FiInfo, FiShield, FiTruck } from 'react-icons/fi';
import styles from './ProductDetail.module.css';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CinematicViewer from '@/components/ModelViewer/CinematicViewer';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
}

const ProductDetailView = ({ product, initialReviews = [] }: { product: Product, initialReviews?: any[] }) => {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { isLowPower, webGLSupported } = usePerformance();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [showModel, setShowModel] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const show3D = webGLSupported && !isLowPower;
  
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddToCart = () => {
    setAdding(true);
    addToCart(product, selectedVariant);
    setTimeout(() => setAdding(false), 1500);
  };

  const handleSubmitReview = async () => {
    if (!newRating || !newComment || !isAuthenticated) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: user?.name,
          userEmail: user?.email,
          rating: newRating,
          comment: newComment
        })
      });
      if (res.ok) {
        const review = await res.json();
        setReviews([review, ...reviews]);
        setNewRating(0);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : null;

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        {/* Navigation Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <button onClick={() => router.back()} className={styles.backLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <FiArrowLeft /> Back to previous
          </button>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{product.category}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{product.name}</span>
        </nav>

        <div className={styles.mainGrid}>
          {/* Left: Sticky Image Gallery */}
          <div className={styles.gallerySide}>
            <div className={styles.mainImageWrapper}>
              <div className={styles.studioBackdrop}></div>
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className={styles.mainImage}
                style={{ transform: product.rotation ? `rotate(${product.rotation}deg)` : 'none' }}
              />
              
              {product.model3d && (
                <button 
                  className={styles.floating3dBtn}
                  onClick={() => setShowModel(true)}
                >
                  <FiMaximize2 /> {show3D ? 'EXPLORE IN 3D' : 'ENLARGE ARTIFACT'}
                </button>
              )}
            </div>
            
            <div className={styles.thumbnailStrip}>
              <div className={styles.thumbActive}>
                <Image src={product.image} alt="Front View" width={80} height={80} />
              </div>
              {/* Future: Add more views if available in data */}
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className={styles.infoSide}>
            <div className={styles.header}>
              <span className={styles.categoryBadge}>{product.category}</span>
              <h1 className={styles.productName}>{product.name}</h1>
              <div className={styles.ratingRow}>
                {avgRating ? (
                  <>
                    <div className={styles.stars}>
                      {'★'.repeat(Math.floor(avgRating))}{'☆'.repeat(5 - Math.floor(avgRating))}
                    </div>
                    <span className={styles.reviewCount}>({reviews.length} practitioner reviews)</span>
                  </>
                ) : (
                  <span className={styles.unrated}>UNRATED</span>
                )}
              </div>
            </div>

            <div className={styles.pricingBlock}>
              <div className={styles.priceRow}>
                <span className={styles.currency}>₹</span>
                <span className={styles.price}>{selectedVariant.price.toLocaleString()}</span>
                {selectedVariant.old_price > selectedVariant.price && (
                  <span className={styles.oldPrice}>₹{selectedVariant.old_price.toLocaleString()}</span>
                )}
              </div>
              <p className={styles.taxInfo}>Inclusive of all heritage preservation taxes</p>
            </div>

            {/* Variant Selector */}
            <div className={styles.variantsBlock}>
              <h3 className={styles.sectionTitle}>SELECT SPECIFICATION</h3>
              <div className={styles.variantGrid}>
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    className={`${styles.variantBtn} ${selectedVariant.size === v.size ? styles.activeVariant : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <span className={styles.vSize}>{v.size}</span>
                    <span className={styles.vPrice}>₹{v.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amazon-style BuyBox */}
            <div className={styles.buyBox}>
              <div className={styles.stockStatus}>
                <div className={styles.statusDot}></div>
                IN STOCK & READY FOR DISPATCH
              </div>
              
              <button 
                className={`btnPremium btnPremiumGold ${adding ? styles.added : ''}`}
                onClick={handleAddToCart}
                disabled={adding}
              >
                <FiShoppingBag /> {adding ? 'SECURED IN BAG' : 'ADD TO COLLECTION'}
              </button>
              
              <button className="btnPremium btnPremiumGlass" style={{ width: '100%', marginTop: '10px' }}>
                ACQUIRE IMMEDIATELY
              </button>

              <div className={styles.trustSignals}>
                <div className={styles.signal}>
                  <FiTruck /> <span>Secure Global Dispatch</span>
                </div>
                <div className={styles.signal}>
                  <FiShield /> <span>Authenticity Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Description & Specs */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>THE CHRONICLE</h3>
              <p className={styles.descriptionText}>{product.description}</p>
              
              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>ARTIFACT TYPE</span>
                  <span className={styles.specValue}>{product.isWeapon ? 'Weaponry' : 'Heritage Artifact'}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>CRAFTSMANSHIP</span>
                  <span className={styles.specValue}>Lemuria Masterforge</span>
                </div>
                {/* Future: Add more specific specs from data if available */}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className={styles.reviewsSection}>
          <h2 className={styles.reviewsTitle}>PRACTITIONER FEEDBACK</h2>
          
          <div className={styles.reviewGrid}>
            <div className={styles.reviewList}>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerName}>{review.userName.toUpperCase()}</div>
                      <div className={styles.stars}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      <div className={styles.reviewDate}>
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                    <p className={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className={styles.emptyReviews}>
                  No practitioner feedback has been logged for this artifact yet.
                </div>
              )}
            </div>

            <div className={styles.reviewForm}>
              <h3 className={styles.formTitle}>LOG AN EXPERIENCE</h3>
              {isAuthenticated ? (
                <>
                  <div className={styles.ratingInput}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`${styles.starBtn} ${newRating >= star ? styles.starActive : ''}`}
                        onClick={() => setNewRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    className={styles.textArea}
                    placeholder="Describe your experience with this artifact..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                  <button 
                    className="btnPremium btnPremiumGold" 
                    style={{ width: '100%' }}
                    onClick={handleSubmitReview}
                    disabled={submitting || !newRating || !newComment}
                  >
                    {submitting ? 'LOGGING...' : 'SUBMIT LOG'}
                  </button>
                </>
              ) : (
                <div className={styles.authPrompt}>
                  <p>Please <Link href="/auth/signin" style={{color: '#BF953F', fontWeight: 900}}>SIGN IN</Link> to log your experience with this artifact.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 3D Model Explorer Overlay */}
      <AnimatePresence>
        {showModel && product.model3d && (
          <CinematicViewer
            src={product.model3d}
            name={product.name}
            image={product.image}
            onClose={() => setShowModel(false)}
            modelRotation={product.modelRotation}
            modelRotationX={product.modelRotationX}
            modelRotationZ={product.modelRotationZ}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailView;
