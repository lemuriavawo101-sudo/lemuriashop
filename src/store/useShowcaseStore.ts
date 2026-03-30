import { create } from 'zustand';

export interface Variant {
  size: string;
  price: number;
  old_price: number;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  isWeapon: boolean;
  variants: Variant[];
  image: string;
  model3d?: string;
  rotation?: number;
  modelRotation?: number;
  modelRotationX?: number;
  modelRotationZ?: number;
  artifactType: string;
  stock: 'In Stock' | 'Out of Stock';
  avgRating?: number | null;
  reviewCount?: number;
}

interface ShowcaseState {
  isOpen: boolean;
  products: Product[];
  currentIndex: number;
  progress: number; // 0 to 100
  
  // Actions
  open: (products: Product[], startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  setProgress: (progress: number) => void;
}

export const useShowcaseStore = create<ShowcaseState>((set, get) => ({
  isOpen: false,
  products: [],
  currentIndex: 0,
  progress: 0,

  open: (products, startIndex = 0) => set({ 
    isOpen: true, 
    products, 
    currentIndex: startIndex,
    progress: 0 
  }),

  close: () => set({ 
    isOpen: false, 
    progress: 0 
  }),

  next: () => {
    const { products, currentIndex } = get();
    if (products.length === 0) return;
    set({ 
      currentIndex: (currentIndex + 1) % products.length,
      progress: 0
    });
  },

  prev: () => {
    const { products, currentIndex } = get();
    if (products.length === 0) return;
    set({ 
      currentIndex: (currentIndex - 1 + products.length) % products.length,
      progress: 0
    });
  },

  setProgress: (progress) => set({ progress }),
}));
