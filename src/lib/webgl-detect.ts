"use client";

import { useState, useEffect } from 'react';

/**
 * Detects whether the device can handle WebGL 3D rendering.
 * Returns false on devices with:
 * - No WebGL support
 * - Software-only rendering (no GPU acceleration)
 * - Very low device memory
 * - Mobile devices with limited GPU
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      
      // Try WebGL2 first, fallback to WebGL1
      const gl = (
        canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
        canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
      ) as WebGLRenderingContext | null;

      if (!gl) {
        setSupported(false);
        return;
      }

      // Check for software rendering via renderer info
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
        const lowEnd = /swiftshader|llvmpipe|software|mesa/i.test(renderer);
        if (lowEnd) {
          setSupported(false);
          return;
        }
      }

      // Check device memory (Chrome only, but useful indicator)
      const nav = navigator as any;
      if (nav.deviceMemory && nav.deviceMemory < 4) {
        setSupported(false);
        return;
      }

      // Check hardware concurrency (CPU cores)
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        setSupported(false);
        return;
      }

      setSupported(true);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}

/**
 * Synchronous check (for non-hook contexts).
 * Returns true if WebGL is likely supported.
 */
export function checkWebGLSync(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    const gl = (
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    ) as WebGLRenderingContext | null;

    return !!gl;
  } catch {
    return false;
  }
}
