"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

interface WishlistItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  model3d?: string;
  variants: any[];
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (product: any) => void;
  isInWishlist: (id: number) => boolean;
  wishlistCount: number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Load from LocalStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('lemuria_wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist from localStorage", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('lemuria_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = useCallback((product: any) => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev;
      return [...prev, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.variants?.[0]?.price || 0,
        image: product.image,
        model3d: product.model3d,
        variants: product.variants || []
      }];
    });
    
    showToast(`${product.name} preserved in your wishlist.`);
  }, [isAuthenticated, router, showToast]);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const isInWishlist = useCallback((id: number) => {
    return wishlistItems.some(item => item.id === id);
  }, [wishlistItems]);

  const toggleWishlist = useCallback((product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showToast(`${product.name} removed from your collection.`);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist, showToast]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  const wishlistCount = wishlistItems.length;

  const contextValue = useMemo(() => ({
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount,
    clearWishlist
  }), [wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, wishlistCount, clearWishlist]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
