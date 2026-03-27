"use client";

import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getTypeClass = () => {
    switch (type) {
      case 'error': return styles.error;
      case 'info': return styles.info;
      default: return styles.success;
    }
  };

  return (
    <div className={`${styles.toast} ${getTypeClass()} ${isVisible ? styles.toastVisible : ''}`}>
      <div className={styles.dot} />
      <span className={styles.message}>{message}</span>
    </div>
  );
};

export default Toast;
