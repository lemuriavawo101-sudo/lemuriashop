"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './Navbar.module.css';

import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;

  const handleCartClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logoContainer}>
            <Image 
              src="/lemuria-logo.png" 
              alt="Lemuria Logo" 
              width={220} 
              height={60} 
              className={styles.mainLogo}
              priority
            />
          </Link>
          
          <div className={styles.navLinks}>
            <Link href="/" className={pathname === '/' ? styles.active : ''}>HOME</Link>
            <Link href="/products" className={pathname === '/products' ? styles.active : ''}>PRODUCTS</Link>
            <a href="#">CONTACT</a>
            {user?.role === 'admin' && (
              <Link href="/admin" className={pathname.startsWith('/admin') ? styles.adminBadge : styles.adminBadge}>ADMIN</Link>
            )}
          </div>
        </div>

        <div className={styles.rightActions}>
          <div className={styles.icons}>
            <ThemeToggle />
            {isAuthenticated ? (
              <div className={styles.userSection}>
                <span className={styles.welcomeText}>WELCOME, <span className={styles.userName}>{user?.name.toUpperCase()}</span></span>
                <button onClick={logout} className={styles.logoutBtn}>LOGOUT</button>
              </div>
            ) : (
              <Link href="/auth/signin" className={styles.registerLink}>SIGN IN / REGISTER</Link>
            )}

            <Link href="/wishlist" className={styles.wishlistIconWrapper}>
              <span className={styles.cartLabel}>WISHLIST</span>
              <div className={styles.cartIconBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.cartSvg}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {wishlistCount > 0 && <span className={styles.cartBadge}>{wishlistCount}</span>}
              </div>
            </Link>

            <div className={styles.cartIconWrapper} onClick={handleCartClick}>
              <span className={styles.cartLabel}>CART</span>
              <div className={styles.cartIconBox}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.cartSvg}>
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
