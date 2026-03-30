"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../auth.module.css';

export default function CompleteProfile() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updatePhone, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if they already have a phone or aren't logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user && !user.needsPhone) {
      router.push('/');
    }
  }, [user, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Phone number is required to proceed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePhone(phone);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
     return (
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <p className={styles.subtitle}>Please sign in to complete your profile</p>
            <button onClick={() => router.push('/auth/register')} className={styles.submitBtn}>
              Go to Register
            </button>
          </div>
        </div>
     );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>FINAL STEP</h1>
        <p className={styles.subtitle}>Complete your practitioner profile</p>
        
        <p className={styles.infoText}>
          Welcome, <strong>{user?.name}</strong>. To ensure we can reach you regarding artifacts and commissions, please provide your mobile number.
        </p>

        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Mobile Number</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              required 
              placeholder="e.g. +91 9876543210"
              autoFocus
            />
          </div>
          <div className={styles.infoTextSmall}>
            We'll only use this for important notifications about your heritage acquisitions.
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Finalizing...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
