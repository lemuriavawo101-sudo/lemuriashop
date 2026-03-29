"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { View, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

const GlobalCanvas = () => {
  const [eventSource, setEventSource] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setEventSource(document.body);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 100000,
      }}
    >
      <Canvas
        eventSource={eventSource || undefined}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        shadows
        style={{ pointerEvents: 'none' }}
        onCreated={(state) => {
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = 1.2;
        }}
      >
        <View.Port />
      </Canvas>
    </div>
  );
};

export default GlobalCanvas;
