"use client";

import React, { Suspense, Component, ReactNode, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, View, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';



// Placeholder shown while loading or when file is missing
function ModelFallback({ message = 'Loading 3D model...' }: { message?: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#D1D5DB', fontFamily: 'monospace', gap: '1rem'
    }}>
      <div style={{ fontSize: '3rem' }}>⚔️</div>
      <div style={{ fontSize: '0.85rem', letterSpacing: '0.15em' }}>{message}</div>
    </div>
  );
}

// Error boundary to gracefully handle missing / corrupt GLB file
class ModelErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ModelFallback message="[ DROP model.glb INTO /public FOLDER ]" />
      );
    }
    return this.props.children;
  }
}

function InteractionHandler({ isInteracting, targetPos }: { isInteracting: boolean, targetPos: THREE.Vector3 }) {
  useFrame((state) => {
    if (!isInteracting) {
      // Lerp camera back to front-on position [0, 0, 8]
      state.camera.position.lerp(targetPos, 0.05);
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

// Apply cinematic, site-matching material overrides to the loaded model
function WeaponModel({ isInteracting, onLoaded }: { isInteracting: boolean, onLoaded?: () => void }) {
  const { scene } = useGLTF('/lionguard_sword_and_shield.glb');
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const applyMaterial = (mat: THREE.Material) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.color.set('#c5a028'); // Deeper Noble Gold (50% darkness balance)
              mat.metalness = 0.9; // Increased for richer contrast in shadows
              mat.roughness = 0.2;
              mat.emissive = new THREE.Color('#330000'); // Subtle red
              mat.emissiveIntensity = 0.2;
              mat.envMapIntensity = 2.0; 
              if (mat.normalMap) mat.normalMap = null;
              if (mat.bumpMap) mat.bumpMap = null;
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
      // Call onLoaded after processing materials
      if (onLoaded) onLoaded();
    }
  }, [scene, onLoaded]);

  // Controlled cinematic oscillation (Posing animation)
  useFrame((state) => {
    if (!groupRef.current || isInteracting) return;
    const time = state.clock.getElapsedTime();
    // Subtle floating Y oscillation
    groupRef.current.position.y = Math.sin(time) * 0.1;
    // Posing animation: slow rotation to left and right
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.5;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.35} dispose={null} />
    </group>
  );
}

export default function HeroModel({ onLoad }: { onLoad?: () => void }) {
  const [isInteracting, setIsInteracting] = React.useState(false);

  return (
    <ModelErrorBoundary>
      <View 
        style={{ 
          width: '100%', height: '100%', 
          position: 'absolute', top: 0, left: 0, 
          zIndex: 10 
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <InteractionHandler 
          isInteracting={isInteracting} 
          targetPos={new THREE.Vector3(0, 0, 5)} 
        />
        
        {/* Cinematic 3-point lighting optimized for light theme */}
        <directionalLight position={[5, 5, 5]} intensity={4.1} color="#FFFFFF" />
        <directionalLight position={[-5, 2, 2]} intensity={1.2} color="#E50914" />
        <directionalLight position={[0, -5, -5]} intensity={0.8} color="#B38F00" />
        <ambientLight intensity={0.4} />

        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
            <WeaponModel isInteracting={isInteracting} onLoaded={onLoad} />
          </Float>
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </View>
    </ModelErrorBoundary>
  );
}
