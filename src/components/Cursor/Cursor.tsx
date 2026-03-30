"use client";

import React, { useEffect, useState, useRef } from 'react';
import styles from './Cursor.module.css';

/**
 * Reconstructed Cursor component to replace the corrupted version.
 * Provides a smooth, interactive custom cursor with a heritage seal reveal on hover.
 */
const Cursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  
  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const haloPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    /**
     * PRECISION INTERACTION ENGINE
     * Using global event delegation instead of individual listeners + MutationObserver.
     * This drastically reduces hydration time and main-thread work.
     */
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], label, .interactive, [data-cursor="hover"]');
      
      if (interactive && interactive.getAttribute('data-cursor') !== 'none') {
        setIsHovered(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], label, .interactive, [data-cursor="hover"]');
      
      if (interactive) {
        setIsHovered(false);
      }
    };

    const updateCursor = () => {
      const dotLag = 0.25;
      const haloLag = 0.15;

      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * dotLag;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * dotLag;

      haloPos.current.x += (mousePos.current.x - haloPos.current.x) * haloLag;
      haloPos.current.y += (mousePos.current.y - haloPos.current.y) * haloLag;

      // GPU-ACCELERATED TRANSFORMS
      // Using translate3d prevents layout thrashing (Forced Reflow)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloPos.current.x}px, ${haloPos.current.y}px, 0)`;
      }
      if (sealRef.current) {
        sealRef.current.style.transform = `translate3d(${haloPos.current.x}px, ${haloPos.current.y}px, 0)`;
      }

      requestAnimationFrame(updateCursor);
    };

    const rafId = requestAnimationFrame(updateCursor);
    
    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseout', handleMouseOut);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div className={`${styles.cursorWrapper} ${isHovered ? styles.hovered : ''}`}>
      <div ref={dotRef} className={styles.cursorDot} aria-hidden="true" />
      <div ref={haloRef} className={styles.cursorHalo} aria-hidden="true" />
      <div 
        ref={sealRef} 
        className={styles.heritageSeal} 
        style={{ backgroundImage: 'url("/favicon.svg")' }}
        aria-hidden="true" 
      />
    </div>
  );
};

export default Cursor;