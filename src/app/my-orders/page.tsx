"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from './my-orders.module.css';
import { generateInvoice } from '@/lib/invoice-generator';
import { FiDownload } from 'react-icons/fi';

interface Order {
  id: string;
  customer: string;
  total: number;
  subtotal: number;
  tax: number;
  protectFee: number;
  shipping: number;
  status: string;
  date: string;
  items: any[];
  delivery: any;
  userId: string;
}

export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${user?.uid}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loaderWrapper}>
          <div className={styles.loader}></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.noOrders}>
          <p>PLEASE SIGN IN TO VIEW YOUR ORDER HISTORY</p>
          <Link href="/auth/signin" className={styles.shopLink}>SIGN IN</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ORDER ARCHIVE</h1>

      {orders.length === 0 ? (
        <div className={styles.noOrders}>
          <p>NO ORDERS FOUND IN YOUR ARCHIVE</p>
          <Link href="/products" className={styles.shopLink}>EXPLORE PRODUCTS</Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.orderId}>ID: {order.id}</div>
                  <div className={styles.orderDate}>{new Date(order.date).toLocaleDateString()}</div>
                </div>
                <div className={`${styles.statusBadge} ${order.status === 'Delivered' ? styles.statusDelivered : ''}`}>
                  {order.status.toUpperCase()}
                </div>
                <button 
                  className={styles.downloadBtn} 
                  onClick={() => generateInvoice(order)}
                  title="Download Tax Invoice"
                  style={{ background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.3)', color: '#FFB400', padding: '5px 10px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  <FiDownload size={14} /> INVOICE
                </button>
              </div>

              <div className={styles.itemsGrid}>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQty}>QTY: {item.quantity}</span>
                    </div>
                    <div className={styles.itemPrice}>₹{(item.price ?? 0) * (item.quantity ?? 1)}</div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <span className={styles.totalLabel}>TOTAL ORDER VALUE</span>
                <span className={styles.totalAmount}>₹{order.total}</span>
              </div>

              {order.status === 'Delivered' && (
                <div className={styles.reviewPrompt}>
                  <div className={styles.reviewText}>
                    <h4>PRODUCT REVIEW REQUIRED</h4>
                    <p>Your order has been delivered. Your feedback helps us improve.</p>
                  </div>
                  <Link 
                    href={`/products/${order.items[0]?.id}?review=true`} 
                    className={styles.reviewBtn}
                  >
                    SUBMIT REVIEW
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
