"use client";

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const GlobalCanvas = dynamic(() => import('./GlobalCanvas'), { ssr: false });

const GlobalCanvasWrapper = () => {
  return (
    <Suspense fallback={null}>
      <GlobalCanvas />
    </Suspense>
  );
};

export default GlobalCanvasWrapper;
