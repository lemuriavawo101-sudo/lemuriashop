"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { View, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { usePerformance } from '@/context/PerformanceContext';

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

const GlobalCanvas = () => {
  const [eventSource, setEventSource] = React.useState<HTMLElement | null>(null);
  const { isLowPower, setWebGLSupported } = usePerformance();

  React.useEffect(() => {
    setEventSource(document.body);
  }, []);

  React.useEffect(() => {
    // Defer to idle callback or timeout to prevent blocking the initial hydration
    const deferWork = () => {
      // Removed global document.body bind to reduce main-thread event overhead
      
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setWebGLSupported(false);
        }
      } catch (e) {
        setWebGLSupported(false);
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(deferWork);
    } else {
      setTimeout(deferWork, 150);
    }
  }, [setWebGLSupported]);

  return (
    <div
      id="global-canvas-root"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2000000,
      }}
    >
      <Canvas
        eventSource={eventSource || undefined}
        gl={{ 
          antialias: !isLowPower, // Disable AA on low power for performance
          alpha: true,
          powerPreference: isLowPower ? "low-power" : "high-performance",
          failIfMajorPerformanceCaveat: true,
        }}
        dpr={isLowPower ? 1 : [1, 1.5]} // Limit DPR on low power
        style={{ pointerEvents: 'none' }}
        onCreated={(state) => {
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = 1.2;
        }}
        onError={() => setWebGLSupported(false)}
      >
        <View.Port />
      </Canvas>
    </div>
  );
};

export default GlobalCanvas;
