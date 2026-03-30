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
      if (!(window as any).Razorpay) {
        alert('The Razorpay Acquisition Engine is still initializing. Please wait a moment and try again.');
        return;
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        console.error('CRITICAL: NEXT_PUBLIC_RAZORPAY_KEY_ID is missing. Check Vercel environment variables.');
        alert('Checkout configuration error: Missing Public Key. Please contact the sanctuary curator.');
        return;
      }

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

      if (!order.id) {
        alert('Artifact acquisition failed: No order ID returned.');
        return;
      }

      // 3. Preserve Acquisition Metadata in Sanctuary Cache (Session Storage)
      // This ensures the data is available for verification after the handshake
      const pendingData = {
        items: JSON.stringify(cartItems.map(i => ({ 
          productId: i.id, 
          variantSize: i.size, 
          quantity: i.quantity, 
          name: i.name 
        }))),
        total: total,
        customer: user?.name || 'Anonymous Practitioner',
        delivery: JSON.stringify(delivery)
      };
      sessionStorage.setItem('pending_acquisition', JSON.stringify(pendingData));

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: 'LEMURIA Heritage',
        description: 'Artifact Acquisition',
        image: '/favicon.svg', 
        order_id: order.id,
        // REMOVED: callback_url & redirect: true (Unstable on Vercel)
        // REPLACED WITH: Frontend handler for immediate client-side redirection
        handler: function (response: any) {
          const successUrl = new URL('/checkout/success', window.location.origin);
          successUrl.searchParams.set('razorpay_payment_id', response.razorpay_payment_id);
          successUrl.searchParams.set('razorpay_order_id', response.razorpay_order_id);
          successUrl.searchParams.set('razorpay_signature', response.razorpay_signature);
          
          window.location.href = successUrl.toString();
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: delivery.contact
        },
        theme: {
          color: '#BF953F'
        },
        modal: {
          ondismiss: function() {
            // Optional: Handle modal close if needed
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Acquisition Blocked: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
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
          <h2>ACQUISITION SANCTUARY</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.itemList}>
            {cartItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Your sanctuary is currently empty.</p>
                <button 
                  className={styles.exploreBtn} 
                  onClick={() => setIsCartOpen(false)}
                >
                  Explore Artifact Gallery
                </button>
              </div>
            ) : (
              <>
                <div className={styles.listHeader}>
                  <h3>YOUR COLLECTION ({cartCount})</h3>
                </div>
                {cartItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'contain' }} />
                    </div>
                    <div className={styles.itemDetails}>
                      <h4>{item.name}</h4>
                      <p className={styles.itemMeta}>{item.size} • QTY: {item.quantity}</p>
                      <span className={styles.itemPrice}>₹{item.price.toLocaleString()}</span>
                      <button 
                        className={styles.removeBtn} 
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        Remove Artifact
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className={styles.checkoutPanel}>
              <div className={styles.deliveryForm}>
                <div className={styles.panelHeader}>
                  <h3>DELIVERY DESTINATION</h3>
                  <p>Provide sanctuary coordinates for secure dispatch.</p>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>PRACTITIONER CONTACT</label>
                  <input 
                    type="tel" 
                    placeholder="10 Digits" 
                    value={delivery.contact}
                    onChange={(e) => setDelivery({...delivery, contact: e.target.value.replace(/\D/g, '')})}
                    onBlur={() => setTouched({...touched, contact: true})}
                  />
                  {touched.contact && !validateContact(delivery.contact) && (
                    <span className={styles.inputHint}>Minimum 10 numeric digits required</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label>SANCTUARY ADDRESS</label>
                  <textarea 
                    placeholder="Full street, building, and apartment details" 
                    rows={4}
                    value={delivery.address}
                    onChange={(e) => setDelivery({...delivery, address: e.target.value})}
                    onBlur={() => setTouched({...touched, address: true})}
                  />
                  {touched.address && !validateAddress(delivery.address) && (
                    <span className={styles.inputHint}>Minimum 10 characters required for dispatch</span>
                  )}
                </div>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>PINCODE</label>
                    <input 
                      type="text" 
                      placeholder="6 Digits" 
                      value={delivery.pincode}
                      onChange={(e) => setDelivery({...delivery, pincode: e.target.value.replace(/\D/g, '')})}
                      onBlur={() => setTouched({...touched, pincode: true})}
                    />
                    {touched.pincode && !validatePincode(delivery.pincode) && (
                      <span className={styles.inputHint}>Valid 6-digit pincode required</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.orderSummary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Subtotal</span>
                  <span className={styles.summaryValue}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Hereditary Tax (GST 18%)</span>
                  <span className={styles.summaryValue}>₹{tax.toLocaleString()}</span>
                </div>
                <div className={styles.totalRow}>
                  <div className={styles.totalLabelGroup}>
                    <span className={styles.totalLabel}>TOTAL COST</span>
                    <span className={styles.totalNote}>INCLUSIVE OF ALL TAXES</span>
                  </div>
                  <span className={styles.totalValue}>₹{total.toLocaleString()}</span>
                </div>

                <button 
                  className={styles.checkoutBtn} 
                  onClick={handlePayment}
                  disabled={!isFormValid}
                >
                  {isFormValid ? 'SECURE ACQUISITION' : 'PROVIDE COORDINATES TO ACQUIRE'}
                </button>
                <div className={styles.securitySeal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.lockIcon}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>SECURED BY RAZORPAY ACQUISITION ENGINE • 256-BIT ENCRYPTION</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutDrawer;
