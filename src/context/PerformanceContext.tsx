"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type PerformanceLevel = 'high' | 'low' | 'auto';

interface PerformanceContextType {
  performanceLevel: PerformanceLevel;
  setPerformanceLevel: (level: PerformanceLevel) => void;
  isLowPower: boolean;
  webGLSupported: boolean;
  setWebGLSupported: (supported: boolean) => void;
  hardwareStats: {
    cores: number;
    memory?: number;
  };
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>('auto');
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hardwareStats, setHardwareStats] = useState<{ cores: number; memory?: number }>({ 
    cores: 4 // Default assume decent
  });

  useEffect(() => {
    // 1. Detect Hardware
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory; // Chrome/Edge only
    setHardwareStats({ cores, memory });

    // 2. Load User Preference
    const saved = localStorage.getItem('lemuria_performance_level');
    if (saved === 'high' || saved === 'low') {
      setPerformanceLevel(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lemuria_performance_level', performanceLevel);
  }, [performanceLevel]);

  const isLowPower = useMemo(() => {
    if (performanceLevel === 'low') return true;
    if (performanceLevel === 'high') return false;
    
    // Auto detection
    if (!webGLSupported) return true;
    if (hardwareStats.cores <= 2) return true; // Most Pentiums have 2 cores
    if (hardwareStats.memory !== undefined && hardwareStats.memory < 4) return true;
    
    return false;
  }, [performanceLevel, webGLSupported, hardwareStats]);

  const contextValue = useMemo(() => ({
    performanceLevel,
    setPerformanceLevel,
    isLowPower,
    webGLSupported,
    setWebGLSupported,
    hardwareStats
  }), [performanceLevel, isLowPower, webGLSupported, hardwareStats]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
