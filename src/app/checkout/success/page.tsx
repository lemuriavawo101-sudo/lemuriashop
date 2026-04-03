"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './success.module.css';
import { generateInvoice } from '@/lib/invoice-generator';
import { FiDownload } from 'react-icons/fi';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

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
            setOrderData({ ...acquisition, id: paymentId });
            
            // 3. Persist to Global Cloud Database (Already handled by server, but we can verify)
            // ... (Optional check if server already saved it)
            
            // 4. Cleanse Sanctuary Cache
            sessionStorage.removeItem('pending_acquisition');
          } else {
            // High-speed fallback: Fetch from DB if cache is gone
            const res = await fetch(`/api/orders?userId=${user?.uid}`);
            const orders = await res.json();
            const currentOrder = orders.find((o: any) => o.id === paymentId);
            if (currentOrder) setOrderData(currentOrder);
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
            <h1 className={styles.title}>PURCHASE SECURED</h1>
            <p className={styles.message}>Your artifacts have been successfully logged in the vault.</p>
            <div className={styles.details}>
              <span>Transaction ID</span>
              <strong>{paymentId}</strong>
            </div>
            <div className={styles.buttonGroup} style={{ display: 'flex', gap: '1rem', marginTop: '2rem', width: '100%', flexDirection: 'column' }}>
              {orderData && (
                <button 
                  className={styles.btn} 
                  onClick={() => generateInvoice(orderData)}
                  style={{ background: 'var(--gold-gradient)', color: 'black', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <FiDownload /> DOWNLOAD TAX INVOICE
                </button>
              )}
              <button 
                className={styles.btn} 
                onClick={() => router.push('/my-orders')}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                CONTINUE TO MY ORDERS
              </button>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => router.push('/')}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                RETURN TO GALLERY
              </button>
            </div>
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
