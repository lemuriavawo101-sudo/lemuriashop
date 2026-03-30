"use client";

import React, { useEffect, useRef, useState, memo } from 'react';
import { useShowcaseStore, Product } from '@/store/useShowcaseStore';
import { AnimatePresence, motion } from 'framer-motion';
import { View, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import styles from './Showcase.module.css';
import CinematicActor from './CinematicActor';
import { usePerformance } from '@/context/PerformanceContext';
import Link from 'next/link';

const CinematicShowcase = () => {
  const { isOpen, products, currentIndex, next, prev, close, progress, setProgress } = useShowcaseStore();
  const { isLowPower, webGLSupported } = usePerformance();
  const [isClipped, setIsClipped] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const LOOP_DURATION = 5000; // 5 seconds as per standard
  const currentProduct = products[currentIndex];
  
  // 1. Core Director Loop (Sequential Logic)
  useEffect(() => {
    if (!isOpen) return;

    const interval = 100; // Update every 100ms
    const start = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const newProgress = Math.min((elapsed / LOOP_DURATION) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        next();
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, currentIndex, next, setProgress]);

  // 2. Pipeline Buffer (Pre-fetch next model)
  useEffect(() => {
    if (isOpen && products.length > 1) {
      const nextIndex = (currentIndex + 1) % products.length;
      const nextProduct = products[nextIndex];
      if (nextProduct?.model3d) {
        console.log(`[Showcase] Pre-fetching next: ${nextProduct.name}`);
        useGLTF.preload(nextProduct.model3d);
      }
    }
  }, [isOpen, currentIndex, products]);

  if (!isOpen || !currentProduct) return null;

  return (
    <div className={styles.overlay}>
      <motion.button 
        className={styles.closeShowcase}
        onClick={close}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ✕
      </motion.button>

      {/* 3D Stage (The Actor System) */}
      <div className={styles.canvasContainer}>
        <View className={styles.canvas}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
          
          {currentProduct.model3d && (
            <CinematicActor 
              src={currentProduct.model3d} 
              modelRotation={currentProduct.modelRotation}
              modelRotationX={currentProduct.modelRotationX}
              modelRotationZ={currentProduct.modelRotationZ}
            />
          )}
        </View>
      </div>

      {/* Cinematic HTML Overlay (Standard HTML for performance) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentProduct.id}
          className={styles.uiOverlay}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.header}>
            <span className={styles.badge}>EXCLUSIVE SHOWCASE</span>
            <span className={styles.missionLabel}>LMR // UNIT-0{currentIndex + 1} // AUTHENTIC</span>
          </div>

          <div className={styles.content}>
            <h1 className={styles.productName}>{currentProduct.name}</h1>
            <p className={styles.description}>{currentProduct.description}</p>
          </div>

          <div className={styles.controls}>
             <Link 
              href={`/products/${currentProduct.id}`} 
              className={styles.viewArtifactBtn}
              onClick={() => close()}
             >
               VIEW ARTIFACT
             </Link>
             <button className={styles.controlBtn} onClick={prev}>PREV</button>
             <button className={styles.controlBtn} onClick={next}>NEXT</button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div 
        className={styles.timerBar} 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default memo(CinematicShowcase);
