"use client";

import { useEffect } from 'react';
import Script from 'next/script';

const SmoothScroll = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      
      const scrollTimeout = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 0);

      let lenis: any;
      // We rely on the Script in layout.tsx to load Lenis
      if ((window as any).Lenis) {
        lenis = new (window as any).Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false,
        });

        // Synchronize Lenis state
        lenis.scrollTo(0, { immediate: true });

        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);
      }

      return () => {
        if (lenis) lenis.destroy();
        clearTimeout(scrollTimeout);
      };
    }
  }, []);

  return null;
};

export default SmoothScroll;
