"use client";

import React, { Suspense, Component, ReactNode, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Environment, Stage, View, PerspectiveCamera } from '@react-three/drei';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import styles from './ModelViewer.module.css';

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

interface CinematicViewerProps {
  src: string;
  name: string;
  onClose: () => void;
  modelRotation?: number;
  modelRotationX?: number;
  modelRotationZ?: number;
}

// Cinematic material processing
function DynamicModel({ src, modelRotation, modelRotationX, modelRotationZ }: { src: string; modelRotation?: number; modelRotationX?: number; modelRotationZ?: number }) {
  const { scene } = useGLTF(src);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const applyMaterial = (mat: THREE.Material) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            // Matte finish for heritage artifact look
            mat.metalness = 0.1;
            mat.roughness = 0.85;
            mat.envMapIntensity = 1.0;
            mat.needsUpdate = true;
          }
        };
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(applyMaterial);
        } else {
          applyMaterial(mesh.material);
        }
      }
    });
  }, [scene]);

  // Apply initial rotation from admin panel
  useEffect(() => {
    if (groupRef.current) {
      if (modelRotation !== undefined) {
        groupRef.current.rotation.y = (modelRotation * Math.PI) / 180;
      }
      if (modelRotationX !== undefined) {
        groupRef.current.rotation.x = (modelRotationX * Math.PI) / 180;
      }
      if (modelRotationZ !== undefined) {
        groupRef.current.rotation.z = (modelRotationZ * Math.PI) / 180;
      }
    }
  }, [modelRotation, modelRotationX, modelRotationZ]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.8} dispose={null} />
    </group>
  );
}


const CinematicViewer: React.FC<CinematicViewerProps> = ({ src, name, onClose, modelRotation, modelRotationX, modelRotationZ }) => {
  const [mounted, setMounted] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Prevent scroll on body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!mounted) return null;

  const content = (
    <div className={styles.overlay}>
      <div className={styles.viewerContainer}>
        <div className={styles.info}>
          <div className={styles.subtitle}>HERITAGE INSPECTION</div>
          <h2 className={styles.title}>{name.toUpperCase()}</h2>
        </div>
        
        <button className={styles.closeBtn} onClick={onClose} data-cursor="none">
          <span className={styles.closeIcon}>✕</span>
          <span className={styles.closeLabel}>CLOSE</span>
        </button>

        <div className={styles.canvasContainer}>
          <View className={styles.canvas}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
            <pointLight position={[-10, -10, -10]} intensity={1} />
            
            <Suspense fallback={null}>
              <Stage intensity={0.5} environment="studio" shadows="contact" adjustCamera={false}>
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                  <DynamicModel src={src} modelRotation={modelRotation} modelRotationX={modelRotationX} modelRotationZ={modelRotationZ} />
                </Float>
              </Stage>
            </Suspense>

            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              makeDefault 
              minDistance={2}
              maxDistance={10}
            />
          </View>
        </div>

        <div className={styles.controlsHint}>
          <span>DRAG TO ROTATE</span>
          <span>SCROLL TO ZOOM</span>
          <span>RIGHT-CLICK TO PAN</span>
        </div>
        
        <div className={styles.referenceWarning}>AUTHENTIC DIGITAL TWIN • PROPERTY OF LEMURIA HERITAGE</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default CinematicViewer;
