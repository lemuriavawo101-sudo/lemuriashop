"use client";

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Stage, Environment, View, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import styles from './ModelViewer.module.css';

interface VisualRotatorProps {
  src: string;
  initialRotation?: { x: number; y: number; z: number };
  onConfirm: (rotation: { x: number; y: number; z: number }) => void;
  onCancel: () => void;
}

function Model({ src, rotation, onUpdate }: { 
  src: string; 
  rotation: THREE.Euler;
  onUpdate: (group: THREE.Group) => void;
}) {
  const { scene } = useGLTF(src);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.copy(rotation);
      onUpdate(groupRef.current);
    }
  }, [rotation, onUpdate]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.metalness = 0.1;
          mesh.material.roughness = 0.85;
          mesh.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.8} dispose={null} />
    </group>
  );
}

const VisualRotator: React.FC<VisualRotatorProps> = ({ src, initialRotation, onConfirm, onCancel }) => {
  const [rotation, setRotation] = useState(new THREE.Euler(
    THREE.MathUtils.degToRad(initialRotation?.x || 0),
    THREE.MathUtils.degToRad(initialRotation?.y || 0),
    THREE.MathUtils.degToRad(initialRotation?.z || 0)
  ));
  
  const modelRef = useRef<THREE.Group | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastMouse.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !modelRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - lastMouse.current.x;
    const deltaY = clientY - lastMouse.current.y;
    
    // Rotate model group directly
    const newRotation = modelRef.current.rotation.clone();
    newRotation.y += deltaX * 0.01;
    newRotation.x += deltaY * 0.01;
    
    setRotation(newRotation);
    lastMouse.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className={styles.rotatorOverlay}>
      <div className={styles.rotatorContainer}>
        <div className={styles.rotatorHeader}>
          <div>
            <h3>VISUAL ORIENTATION Tool</h3>
            <p>Drag the artifact to adjust its 3D TILT and ROTATION for the storefront.</p>
          </div>
          <div className={styles.rotatorActions}>
            <button className={styles.cancelRotator} onClick={onCancel}>CANCEL</button>
            <button className={styles.confirmRotator} onClick={() => {
              if (modelRef.current) {
                const r = modelRef.current.rotation;
                onConfirm({
                  x: Number(THREE.MathUtils.radToDeg(r.x).toFixed(1)),
                  y: Number(THREE.MathUtils.radToDeg(r.y).toFixed(1)),
                  z: Number(THREE.MathUtils.radToDeg(r.z).toFixed(1))
                });
              }
            }}>CONFIRM POSITION</button>
          </div>
        </div>

        <div 
          className={styles.rotatorCanvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: 'grab' }}
        >
          <View className={styles.canvas}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
            
            <Suspense fallback={null}>
              <Stage intensity={0.5} environment="studio" shadows="contact" adjustCamera={false}>
                <Model 
                  src={src} 
                  rotation={rotation} 
                  onUpdate={(group) => { modelRef.current = group; }} 
                />
              </Stage>
            </Suspense>
          </View>
          
          <div className={styles.rotatorHint}>
            DRAG THE MODEL TO ROTATE
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualRotator;
