"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styles from './Hero.module.css';

// Dynamically import the 3D model with SSR disabled to prevent server mismatch crashes
const HeroModel = dynamic(() => import('./HeroModel'), { 
  ssr: false,
  loading: () => (
    <div className={styles.modelLoadingState}>
      <p className={styles.modelNote}>[ INITIALIZING 3D ENGINE... ]</p>
    </div>
  )
});

const Hero: React.FC = () => {
  const [modelLoaded, setModelLoaded] = useState(true);

  return (
    <section className={styles.hero}>
      {/* Optimized Background Image (LCP FIX) */}
      <div className={styles.heroBgContainer}>
        <Image
          src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=1800&auto=format&fit=crop"
          alt="Cinematic Heritage Background"
          fill
          priority
          className={styles.heroBgImage}
          sizes="100vw"
        />
        <div className={styles.heroBgOverlay}></div>
      </div>

      {/* Cinematic Base */}
      <div className={styles.ambientGlowPrimary}></div>
      <div className={styles.ambientGlowSecondary}></div>
      <div className={styles.filmGrain}></div>
      <div className={styles.lensFlare}></div>

      {/* Massive Background Typography */}
      <div className={styles.watermark}>LEMURIA</div>

      <div className={styles.container}>
        {/* Left Side: Cinematic Content Area */}
        <div className={styles.contentArea}>
          
          {/* Eyebrow */}
          <div className={`${styles.eyebrow} ${styles.animateFadeIn}`}>
            <span className={styles.nIcon}>N</span>
            <span className={styles.seriesText}>SIGNATURE COLLECTION</span>
          </div>

          {/* Title with Reveal Animation */}
          <h1 className={styles.title}>
            <div className={styles.revealWrapper}>
              <span className={styles.revealText}>THE ART</span>
            </div>
            <div className={styles.revealWrapper}>
              <span className={`${styles.revealText} ${styles.delay1}`}>OF BLADE</span>
            </div>
          </h1>

          {/* Description with Reveal Animation */}
          <div className={`${styles.description} ${styles.animateFadeInDelayed}`}>
            <div className={styles.revealWrapper}>
              <p className={`${styles.revealText} ${styles.delay2}`}>
                Unleash precision. Balance energy. Handforged excellence designed for the modern practitioner.
              </p>
            </div>
            <div className={styles.revealWrapper}>
              <p className={`${styles.revealText} ${styles.delay3}`}>
                A cinematic experience in every strike.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`${styles.actionGroup} ${styles.animateFadeInDelayedMore}`}>
            <button className="btnPremium btnPremiumGold" aria-label="Play Cinematic Weapon Showcase">
              <span className={styles.btnIcon}>▶</span> Play Showcase
            </button>
            <button className="btnPremium btnPremiumGlass" aria-label="View Detailed Craftsmanship Information">
              <span className={styles.btnIcon}>ℹ</span> More Info
            </button>
          </div>

          {/* Bottom Tabs */}
          <div className={`${styles.bottomTabs} ${styles.animateFadeInLate}`}>
            <span className={`${styles.tab} ${styles.activeTab}`}>OVERVIEW</span>
            <span className={styles.tab}>CRAFTSMANSHIP</span>
            <span className={styles.tab}>MATERIALS</span>
            <span className={styles.tab}>GALLERY</span>
          </div>
        </div>

        {/* Right Side: Free-Floating 3D Model */}
        <div className={`${styles.mediaArea} ${styles.animateFadeInLate}`}>
          <div className={styles.weaponBackdrop}></div>
          
          {/* Creative Technical Focus Frame */}
          <div className={styles.focusFrame}>
            <div className={styles.focusBracketTL}></div>
            <div className={styles.focusBracketTR}></div>
            <div className={styles.focusBracketBL}></div>
            <div className={styles.focusBracketBR}></div>
            <div className={styles.focusCoords}>LMR // 097-42 // SYST. ACTIVE</div>
          </div>

          {/* 3D model loads automatically */}

          {modelLoaded && <HeroModel onLoad={() => setModelLoaded(true)} />}
          
          <div className={`${styles.modelNote} ${modelLoaded ? styles.modelNoteVisible : ''}`}>
             [ LEMURIA SIGNATURE // MODEL-X ]
          </div>
        </div>


      </div>
    </section>
  );
};

export default Hero;
