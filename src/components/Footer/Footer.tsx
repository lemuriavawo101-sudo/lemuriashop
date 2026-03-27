"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';
import { useAuth } from '@/context/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Column 1: Identity */}
        <div className={styles.column}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/favicon.svg" 
              alt="Lemuria Logo" 
              width={80} 
              height={80} 
              className={styles.footerLogo}
            />
          </div>
          <p className={styles.description}>
            Lemuria Varmakalari Adimurai World Organization, is an unlisted private company incorporated on 14 September, 2021.
          </p>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialBtn} aria-label="Facebook">
              <span className={styles.socialIcon}>f</span>
            </a>
            <a href="#" className={styles.socialBtn} aria-label="X">
              <span className={styles.socialIcon}>𝕏</span>
            </a>
            <a href="#" className={styles.socialBtn} aria-label="LinkedIn">
              <span className={styles.socialIcon}>in</span>
            </a>
            <a href="#" className={styles.socialBtn} aria-label="Instagram">
              <span className={styles.socialIcon}>📷</span>
            </a>
          </div>
        </div>

        {/* Column 2: Sanctuary Support */}
        <div className={styles.column}>
          <h4 className={styles.title}>SUPPORT</h4>
          <div className={styles.links}>
            <Link href="#">About</Link>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Returns & Refunds</Link>
            <Link href="#">Terms & Policy</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>

        {/* Column 3: Quick Shop */}
        <div className={styles.column}>
          <h4 className={styles.title}>QUICK SHOP</h4>
          <div className={styles.links}>
            <Link href="/">HOME</Link>
            <Link href="/products">PRODUCTS</Link>
            <Link href="/#collection">CATEGORIES</Link>
            <a href="#">CONTACT</a>
            {user?.role === 'admin' && (
              <Link href="/admin">ADMIN</Link>
            )}
          </div>
        </div>

        {/* Column 4: Imperial Office */}
        <div className={styles.column}>
          <h4 className={styles.title}>OFFICE</h4>
          <div className={styles.address}>
            <p>LEMURIA VARMAKALARI</p>
            <p>ADIMURAI WORLD</p>
            <p>ORGANIZATION Thaikalam,</p>
            <p>Ramanathichanputhur,</p>
            <p>Marungoor, Kanyakumari</p>
            <p>District, Tamil Nadu-629402</p>
            <div className={styles.contactDetails}>
              <p>+91 9944776601, +91 7708244424</p>
              <p>lemuriamas@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.bottomBar}>
        <p>© {new Date().getFullYear()} LEMURIA HERITAGE. ALL RIGHTS RESERVED SELLING ETHICAL ARTIFACTS.</p>
      </div>
    </footer>
  );
};

export default Footer;
