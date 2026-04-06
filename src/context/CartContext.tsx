"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

interface CartItem {
  id: number;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, variant: any) => void;
  removeFromCart: (id: number, size: string) => void;
  cartCount: number;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
  }, [isCartOpen]);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('lemuria_cart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      // PERMANENT PURIFICATION: Banish localhost traces on load
      const purifiedItems = items.map((i: any) => ({
        ...i,
        image: i.image.includes('localhost') ? i.image.replace(/http:\/\/localhost:\d+/, '') : i.image
      }));
      setCartItems(purifiedItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lemuria_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product: any, variant: any) => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    if (!variant || typeof variant.price === 'undefined') return;

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id && item.size === variant.size);
      if (existingItem) {
        return prev.map(item => 
          (item.id === product.id && item.size === variant.size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        size: variant.size, 
        price: variant.price, 
        image: product.image, 
        quantity: 1
      }];
    });
    
    showToast(`${product.name} (${variant.size}) added to your cart.`);
  }, [isAuthenticated, router, showToast]);

  const removeFromCart = useCallback((id: number, size: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.size === size)));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const contextValue = useMemo(() => ({
    cartItems, 
    addToCart, 
    removeFromCart, 
    cartCount, 
    clearCart, 
    isCartOpen, 
    setIsCartOpen
  }), [cartItems, addToCart, removeFromCart, cartCount, clearCart, isCartOpen]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
