"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  uid: string;
  email: string | null;
  name: string; // Mapped from displayName or Turso
  role: string; // Fetched from Turso
  phone: string; // Fetched from Turso
  needsPhone: boolean; // Flag to enforce profile completion
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  sendMagicLink: (email: string) => Promise<void>;
  completeSignInWithLink: (email: string, url: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updatePhone: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional profile data from our API
        try {
          const response = await fetch(`/api/auth/profile?uid=${firebaseUser.uid}`);
          const data = await response.json();
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
            role: data.role || 'member',
            phone: data.phone || '',
            needsPhone: !data.phone, // Enforce phone number collection
          });
        } catch (err) {
          // Fallback if API fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
            role: 'member',
            phone: '',
            needsPhone: true,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updatePhone = async (phone: string) => {
    if (!auth.currentUser) return;
    
    await fetch('/api/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        phone: phone
      })
    });
    
    // Refresh user state manually
    setUser(prev => prev ? { ...prev, phone, needsPhone: false } : null);
  };

  const sendMagicLink = async (email: string) => {
    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be whitelisted in the Firebase Console.
      url: window.location.origin + '/auth/signin',
      // This must be true.
      handleCodeInApp: true,
    };
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email locally so we don't have to ask the user for it again on the same device
    window.localStorage.setItem('email_for_signin', email);
  };

  const completeSignInWithLink = async (email: string, url: string) => {
    if (isSignInWithEmailLink(auth, url)) {
      await signInWithEmailLink(auth, email, url);
      window.localStorage.removeItem('email_for_signin');
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Sync profile after social login
    if (result.user) {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          phone: result.user.phoneNumber || ''
        })
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading,
      sendMagicLink,
      completeSignInWithLink,
      signInWithGoogle,
      updatePhone,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
