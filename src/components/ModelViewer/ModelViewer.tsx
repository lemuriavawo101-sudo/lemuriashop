"use client";

import React, { useEffect } from 'react';
import styles from './ModelViewer.module.css';

interface ModelViewerProps {
  src: string;
  name: string;
  onClose: () => void;
  initialYRotation?: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

// Also handle React 18+ JSX namespace
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

const ModelViewer: React.FC<ModelViewerProps> = ({ src, name, onClose, initialYRotation }) => {
  return (
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
        
        <model-viewer
          src={src}
          alt={`A 3D model of ${name}`}
          auto-rotate
          camera-controls
          orientation={`${initialYRotation || 0}deg 0deg 0deg`}
          shadow-intensity="1"
          environment-image="neutral"
          exposure="1"
          interaction-prompt="auto"
          className={styles.modelViewer}
        >
          <div className={styles.controlsHint}>
            <span>ONE-FINGER TO ROTATE</span>
            <span>TWO-FINGER / RIGHT-CLICK TO PAN</span>
            <span>PINCH TO ZOOM</span>
          </div>
          <div className={styles.referenceWarning}>REFERENCE ONLY • NOT FOR REPLICATION</div>
        </model-viewer>
      </div>
    </div>
  );
};

export default ModelViewer;
