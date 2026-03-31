"use client";

import React, { useState, useEffect } from 'react';
import styles from './Products.module.css';

interface ProductCollectionLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export default function ProductCollectionLayout({ children, sidebar }: ProductCollectionLayoutProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setShowFilters(false);
      else setShowFilters(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleFilters = () => setShowFilters(!showFilters);

  return (
    <div className={styles.container}>
      {/* Mobile Backdrop */}
      <div 
        className={`${styles.backdrop} ${showFilters && isMobile ? styles.backdropVisible : ''}`}
        onClick={() => setShowFilters(false)}
      />

      <div className={styles.gridInfo}>
        <button 
          className={styles.filterToggle} 
          onClick={toggleFilters}
          aria-label="Toggle Filters"
        >
          <span className={styles.toggleIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {showFilters && !isMobile ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </>
              )}
            </svg>
          </span>
          {showFilters && !isMobile ? "HIDE FILTERS" : "FILTERS"}
        </button>
        <div className={styles.count}>SHOWING ALL ARTIFACTS IN THE ARCHIVE</div>
      </div>

      <div className={styles.mainLayout}>
        <div className={`${styles.sidebar} ${!showFilters ? styles.sidebarClosed : ''} ${showFilters && isMobile ? styles.sidebarOpenMobile : ''}`}>
          {sidebar}
        </div>
        
        <section className={styles.contentArea}>
          {children}
        </section>
      </div>
    </div>
  );
}
