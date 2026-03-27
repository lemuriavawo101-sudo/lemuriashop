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

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const updateCursor = () => {
      const dotLag = 0.25;
      const haloLag = 0.15;

      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * dotLag;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * dotLag;

      haloPos.current.x += (mousePos.current.x - haloPos.current.x) * haloLag;
      haloPos.current.y += (mousePos.current.y - haloPos.current.y) * haloLag;

      // Use left/top for positioning to allow CSS transform (translate -50%, -50%) 
      // and brand-specific scaling to function without JS conflict.
      if (dotRef.current) {
        dotRef.current.style.left = `${dotPos.current.x}px`;
        dotRef.current.style.top = `${dotPos.current.y}px`;
      }
      if (haloRef.current) {
        haloRef.current.style.left = `${haloPos.current.x}px`;
        haloRef.current.style.top = `${haloPos.current.y}px`;
      }
      if (sealRef.current) {
        sealRef.current.style.left = `${haloPos.current.x}px`;
        sealRef.current.style.top = `${haloPos.current.y}px`;
      }

      requestAnimationFrame(updateCursor);
    };

    const rafId = requestAnimationFrame(updateCursor);
    window.addEventListener('mousemove', handleMouseMove);

    const attachHoverListeners = () => {
      const selectors = 'a, button, [role="button"], input[type="submit"], input[type="button"], label, .interactive, [data-cursor="hover"]';
      const elements = document.querySelectorAll(selectors);
      elements.forEach(el => {
        // Skip elements marked with data-cursor="none"
        if (el.getAttribute('data-cursor') === 'none') return;
        
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    attachHoverListeners();

    const observer = new MutationObserver(() => {
      attachHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
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