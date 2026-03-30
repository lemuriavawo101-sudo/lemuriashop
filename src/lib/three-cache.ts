import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CacheEntry {
  lastAccessed: number;
  scene: THREE.Group | null;
}

class ThreeGPUCache {
  private registry: Map<string, CacheEntry> = new Map();
  private CLEANUP_THRESHOLD = 30000; // 30 seconds
  private CHECK_INTERVAL = 10000;    // 10 seconds
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startCleanupLoop();
    }
  }

  private startCleanupLoop() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.cleanupItems(), this.CHECK_INTERVAL);
  }

  public touch(src: string, scene?: THREE.Group) {
    this.registry.set(src, {
      lastAccessed: Date.now(),
      scene: scene || this.registry.get(src)?.scene || null
    });
  }

  private cleanupItems() {
    const now = Date.now();
    for (const [src, entry] of this.registry.entries()) {
      if (now - entry.lastAccessed > this.CLEANUP_THRESHOLD) {
        this.disposeModel(src, entry.scene);
        this.registry.delete(src);
      }
    }
  }

  private disposeModel(src: string, scene: THREE.Group | null) {
    console.log(`[GPU Cache] Purging stale model: ${src}`);
    
    if (scene) {
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          mesh.geometry.dispose();
          
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    }

    // Clear from @react-three/drei cache
    try {
      useGLTF.clear(src);
    } catch (e) {
      // Ignore if already cleared
    }
  }
}

export const gpuCache = new ThreeGPUCache();
