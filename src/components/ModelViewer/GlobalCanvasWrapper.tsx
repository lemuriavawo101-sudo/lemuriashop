"use client";

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { useWebGLSupport } from '@/lib/webgl-detect';

const GlobalCanvas = dynamic(() => import('./GlobalCanvas'), { ssr: false });

const GlobalCanvasWrapper = () => {
  const webglSupported = useWebGLSupport();

  // Don't render the 3D canvas on unsupported devices
  if (webglSupported === null) return null; // Still detecting
  if (!webglSupported) return null; // Not supported

  return (
    <Suspense fallback={null}>
      <GlobalCanvas />
    </Suspense>
  );
};

export default GlobalCanvasWrapper;
