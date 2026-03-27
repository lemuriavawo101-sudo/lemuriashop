"use client";

import { useEffect } from 'react';
import Script from 'next/script';

const SmoothScroll = () => {
  useEffect(() => {
    // Force scroll to top on reload/mount
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // We rely on the Script in layout.tsx to load Lenis
    if (typeof window !== 'undefined' && (window as any).Lenis) {
      const lenis = new (window as any).Lenis({
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

      return () => {
        lenis.destroy();
      };
    }
  }, []);

  return null;
};

export default SmoothScroll;
