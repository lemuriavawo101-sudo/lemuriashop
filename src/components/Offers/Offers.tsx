"use client";

import React from 'react';
import styles from './Offers.module.css';

interface Offer {
  id: number;
  badge: string;
  title: string;
  description: string;
  action: string;
  accent: string;
}

const offers: Offer[] = [
  {
    id: 1,
    badge: "FESTIVAL SALE",
    title: "ANCIENT WEAPONRY // 20% OFF",
    description: "Use code LEMURIA20 for a limited time discount on all handcrafted training tools.",
    action: "SHOP WEAPONS",
    accent: "rgba(229, 9, 20, 0.1)"
  },
  {
    id: 2,
    badge: "GIFT BUNDLE",
    title: "HEALER'S COMPANION",
    description: "Receive a complimentary Varma Thailam (100ml) on all orders over ₹5,000.",
    action: "CLAIM OFFER",
    accent: "rgba(181, 151, 86, 0.1)"
  },
  {
    id: 3,
    badge: "MEMBERSHIP",
    title: "HERITAGE CLUB // FREE SHIPPING",
    description: "Join our exclusive circle for complimentary worldwide delivery on all museum-grade pieces.",
    action: "JOIN NOW",
    accent: "rgba(0, 0, 0, 0.04)"
  }
];

const Offers: React.FC = () => {
  return (
    <section className={styles.offersSection}>
      <div className={styles.ambientGlow}></div>
      <div className={styles.filmGrain}></div>
      
      <div className={styles.container}>
        <div className={styles.grid}>
          {offers.map((offer) => (
            <div key={offer.id} className={styles.offerCard} style={{ '--accent-soft': offer.accent } as React.CSSProperties}>
              <div className={styles.cardHeader}>
                <span className={styles.badge}>{offer.badge}</span>
                <div className={styles.revealWrapper}>
                  <h3 className={styles.title}>{offer.title}</h3>
                </div>
              </div>
              <p className={styles.description}>{offer.description}</p>
              <button className={styles.actionBtn}>
                {offer.action} <span className={styles.arrow}>→</span>
              </button>
              
              <div className={styles.technicalCoords}>LMR // HL-0{offer.id} // ACTIVE</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offers;
