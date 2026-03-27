"use client";

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import styles from './CheckoutDrawer.module.css';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutDrawer: React.FC = () => {
  const { cartItems, cartCount, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // GST 18%
  const total = subtotal + tax;

  const [delivery, setDelivery] = React.useState({
    address: '',
    contact: '',
    pincode: ''
  });

  const validateContact = (val: string) => /^\d{10,}$/.test(val);
  const validatePincode = (val: string) => /^\d{6,}$/.test(val);
  const validateAddress = (val: string) => val.length >= 10;

  const isFormValid = validateContact(delivery.contact) && 
                      validatePincode(delivery.pincode) && 
                      validateAddress(delivery.address);

  const [touched, setTouched] = React.useState({
    contact: false,
    address: false,
    pincode: false
  });

  const handlePayment = async () => {
    if (total <= 0) {
      alert('The sanctuary requires a minimum offering of ₹1 for acquisition. Please select a priced artifact.');
      return;
    }

    if (!isFormValid) {
      alert('Please complete the delivery sanctuary details with valid information to initiate acquisition.');
      return;
    }

    try {
      // 1. Create Order on Backend with Sanctuary Notes for Recovery
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total,
          notes: {
            items: JSON.stringify(cartItems.map(i => ({ 
              productId: i.id, 
              variantSize: i.size, 
              quantity: i.quantity, 
              name: i.name 
            }))),
            total: total,
            customer: user?.name || 'Anonymous Practitioner',
            delivery: JSON.stringify(delivery)
          }
        })
      });
      const order = await response.json();
      console.log('--- Acquisition Order Data ---', order);

      if (!order.id) {
        console.error('CRITICAL: Order ID is missing.');
        alert('Artifact acquisition failed: No order ID returned.');
        return;
      }

      // 2. Initialize Razorpay Checkout with Server Callback and Full Redirect
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: 'LEMURIA Heritage',
        description: 'Artifact Acquisition',
        image: '/favicon.svg', 
        order_id: order.id,
        callback_url: `${window.location.origin}/api/razorpay/callback`,
        redirect: true, // FORCE FULL PAGE REDIRECT
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: delivery.contact
        },
        theme: {
          color: '#BF953F'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Acquisition FAILED:', response.error);
        alert(`Acquisition Blocked: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
      console.error('Secure Connection Initiation Error:', error);
      alert('Secure connection failed: ' + (error.message || 'The checkout sanctuary is temporarily unreachable.'));
    }
  };

  return (
    <>
      <div 
        className={`${styles.drawerOverlay} ${isCartOpen ? styles.drawerOpen : ''}`} 
        onClick={() => setIsCartOpen(false)}
      />
      
      <div className={`${styles.drawer} ${isCartOpen ? styles.drawerContentOpen : ''}`}>
        <div className={styles.header}>
          <h2>YOUR COLLECTION</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className={styles.itemList}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Your sanctuary is empty.</p>
              <button 
                className={styles.checkoutBtn} 
                onClick={() => setIsCartOpen(false)}
              >
                Explore Gallery
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: 'contain' }} />
                </div>
                <div className={styles.itemDetails}>
                  <h4>{item.name}</h4>
                  <p className={styles.itemMeta}>{item.size} • QTY: {item.quantity}</p>
                  <span className={styles.itemPrice}>₹{item.price.toLocaleString()}</span>
                  <br />
                  <button 
                    className={styles.removeBtn} 
                    onClick={() => removeFromCart(item.id, item.size)}
                  >
                    Remove Artifact
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.deliveryForm}>
              <h3>DELIVERY SANCTUARY</h3>
              
              <div className={styles.inputGroup}>
                <input 
                  type="tel" 
                  placeholder="Practitioner Contact (10 Digits)" 
                  value={delivery.contact}
                  onChange={(e) => setDelivery({...delivery, contact: e.target.value.replace(/\D/g, '')})}
                  onBlur={() => setTouched({...touched, contact: true})}
                />
                {touched.contact && !validateContact(delivery.contact) && (
                  <span className={styles.inputHint}>Minimum 10 numeric digits required</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <textarea 
                  placeholder="Complete Heritage Destination (Full Address)" 
                  rows={2}
                  value={delivery.address}
                  onChange={(e) => setDelivery({...delivery, address: e.target.value})}
                  onBlur={() => setTouched({...touched, address: true})}
                />
                {touched.address && !validateAddress(delivery.address) && (
                  <span className={styles.inputHint}>Minimum 10 characters required for dispatch</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="Pincode (6 Digits)" 
                  value={delivery.pincode}
                  onChange={(e) => setDelivery({...delivery, pincode: e.target.value.replace(/\D/g, '')})}
                  onBlur={() => setTouched({...touched, pincode: true})}
                />
                {touched.pincode && !validatePincode(delivery.pincode) && (
                  <span className={styles.inputHint}>Valid 6-digit pincode required</span>
                )}
              </div>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Subtotal</span>
              <span className={styles.summaryValue}>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Hereditary Tax (GST 18%)</span>
              <span className={styles.summaryValue}>₹{tax.toLocaleString()}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.totalLabel}>TOTAL ACQUISITION</span>
              <span className={styles.totalValue}>₹{total.toLocaleString()}</span>
            </div>

            <button 
              className={styles.checkoutBtn} 
              onClick={handlePayment}
              disabled={!isFormValid}
            >
              {isFormValid ? 'SECURE ACQUISITION' : 'COMPLETE FORM TO UNLOCK'}
            </button>
            <span className={styles.paymentNote}>SECURED BY RAZORPAY • 256-BIT ENCRYPTION</span>
          </div>
        )}
      </div>
    </>
  );
};

export default CheckoutDrawer;
