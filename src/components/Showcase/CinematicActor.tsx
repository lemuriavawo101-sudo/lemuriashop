"use client";

import React, { useEffect, useRef } from 'react';
import { useGLTF, Float, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useFrame } from '@react-three/fiber';

interface CinematicActorProps {
  src: string;
  modelRotation?: number;
  modelRotationX?: number;
  modelRotationZ?: number;
}

/**
 * Explicit GPU Memory Disposal Helper
 * Prevents memory leaks by stripping geometries, materials and textures
 */
const disposeObject = (obj: any) => {
  if (obj.geometry) obj.geometry.dispose();
  
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach((mat: THREE.Material) => {
        // Dispose textures
        Object.values(mat).forEach((val: any) => {
          if (val instanceof THREE.Texture) val.dispose();
        });
        mat.dispose();
      });
    } else {
      Object.values(obj.material).forEach((val: any) => {
        if (val instanceof THREE.Texture) val.dispose();
      });
      obj.material.dispose();
    }
  }
};

const CinematicActor: React.FC<CinematicActorProps> = ({ 
  src, 
  modelRotation = 0, 
  modelRotationX = 0, 
  modelRotationZ = 0 
}) => {
  const { scene } = useGLTF(src);
  const groupRef = useRef<THREE.Group>(null);
  
  // 1. Manual Disposal on Unmount
  useEffect(() => {
    return () => {
      console.log(`[Showcase] Disposing asset: ${src}`);
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          disposeObject(child);
        }
      });
    };
  }, [scene, src]);

  // 2. Initial Setup & Material Refinement
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const applyMaterial = (mat: THREE.Material) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.metalness = 0.4;
            mat.roughness = 0.3;
            mat.envMapIntensity = 2.0;
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

    if (groupRef.current) {
        groupRef.current.rotation.y = (modelRotation * Math.PI) / 180;
        groupRef.current.rotation.x = (modelRotationX * Math.PI) / 180;
        groupRef.current.rotation.z = (modelRotationZ * Math.PI) / 180;
    }
  }, [scene, modelRotation, modelRotationX, modelRotationZ]);

  // 3. Hero Orbit Animation (GSAP)
  useEffect(() => {
    if (!groupRef.current) return;

    // Reset rotation before starting animation to avoid cumulative drifts
    const initialY = (modelRotation * Math.PI) / 180;
    
    if (groupRef.current) {
        // Expanded 90-degree orbit (PI/2) for better visibility
        gsap.to(groupRef.current.rotation as any, {
          y: initialY + Math.PI / 2,
          duration: 5,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true
        });
    }

    return () => {
      if (groupRef.current) {
        gsap.killTweensOf(groupRef.current.rotation);
      }
    };
  }, [modelRotation]);

  return (
    <Stage intensity={0.8} environment="studio" shadows="contact" adjustCamera={false}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={groupRef}>
          <Center>
            <primitive object={scene} scale={2.8} />
          </Center>
        </group>
      </Float>
    </Stage>
  );
};

export default CinematicActor;

// Decoder path is managed globally in GlobalCanvas.tsx
