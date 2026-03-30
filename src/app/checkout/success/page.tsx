"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './success.module.css';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  const paymentId = searchParams.get('razorpay_payment_id');
  const orderId = searchParams.get('razorpay_order_id');
  const signature = searchParams.get('razorpay_signature');

  useEffect(() => {
    if (!paymentId || !orderId || !signature) {
      setStatus('error');
      setError('Invalid acquisition credentials. Please contact the curator.');
      return;
    }

    const verifyAndSave = async () => {
      try {
        // 1. Verify Signature
        const verifyResp = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature
          })
        });

        if (!verifyResp.ok) throw new Error('Heritage verification failed.');

        // 2. Retrieve Acquisition Metadata from Cache
        const cachedData = sessionStorage.getItem('pending_acquisition');
        if (cachedData) {
          const acquisition = JSON.parse(cachedData);
          
          // 3. Persist to Global Cloud Database
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...acquisition,
              id: paymentId,
              status: 'Paid',
              date: new Date().toISOString(),
              uid: user?.uid || null
            })
          });

          // 4. Cleanse Sanctuary Cache
          sessionStorage.removeItem('pending_acquisition');
        }

        // 5. Clear Cart locally
        clearCart();
        setStatus('success');
      } catch (err: any) {
        setError(err.message || 'The sanctuary handshake was interrupted.');
      }
    };

    verifyAndSave();
  }, [paymentId, orderId, signature, clearCart]);

  return (
    <div className={styles.container}>
      <div className={styles.glassCard}>
        {status === 'verifying' ? (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <h2>VERIFYING ACQUISITION...</h2>
            <p>Syncing your artifacts with the heritage cloud.</p>
          </div>
        ) : status === 'success' ? (
          <div className={styles.success}>
            <div className={styles.icon}>🏺</div>
            <h1 className={styles.title}>ACQUISITION SECURED</h1>
            <p className={styles.message}>Your artifacts have been successfully logged in the vault.</p>
            <div className={styles.details}>
              <span>Transaction ID</span>
              <strong>{paymentId}</strong>
            </div>
            <button className={styles.btn} onClick={() => router.push('/')}>
              RETURN TO GALLERY
            </button>
          </div>
        ) : (
          <div className={styles.success}>
            <div className={styles.icon} style={{ color: '#ff4d4d' }}>⚠️</div>
            <h1 className={styles.title}>BLOCKAGE DETECTED</h1>
            <p className={styles.message}>{error}</p>
            <button className={styles.btn} onClick={() => router.push('/')}>
              RETURN TO GALLERY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.pageWrapper}>
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
