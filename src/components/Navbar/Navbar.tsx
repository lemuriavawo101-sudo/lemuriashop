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
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock scroll when menu is open
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;

  const handleCartClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    } else {
      setIsCartOpen(true);
    }
  };

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/products', label: 'PRODUCTS' },
    { href: '/contact', label: 'CONTACT' },
  ];

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <div 
              className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`} 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
            </div>

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
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={pathname === link.href ? styles.active : ''}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link href="/my-orders" className={pathname === '/my-orders' ? styles.active : ''}>MY ORDERS</Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" className={pathname.startsWith('/admin') ? styles.adminBadge : styles.adminBadge}>ADMIN</Link>
              )}
            </div>
          </div>

          <div className={styles.rightActions}>
            <div className={styles.icons}>
              <ThemeToggle />
              <div className={styles.userSection}>
                {isAuthenticated ? (
                  <>
                    <span className={styles.welcomeText}>WELCOME, <span className={styles.userName}>{user?.name.toUpperCase()}</span></span>
                    <button onClick={logout} className={styles.logoutBtn}>LOGOUT</button>
                  </>
                ) : (
                  <Link href="/auth/register" className={styles.registerLink}>SIGN IN / REGISTER</Link>
                )}
              </div>

              <Link href="/wishlist" className={styles.wishlistIconWrapper} aria-label="View Wishlist">
                <span className={styles.cartLabel}>WISHLIST</span>
                <div className={styles.cartIconBox}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.cartSvg} aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  {wishlistCount > 0 && <span className={styles.cartBadge}>{wishlistCount}</span>}
                </div>
              </Link>

              <div className={styles.cartIconWrapper} onClick={handleCartClick} role="button" aria-label="Open Shopping Cart">
                <span className={styles.cartLabel}>CART</span>
                <div className={styles.cartIconBox}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.cartSvg} aria-hidden="true">
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

      <div 
        className={`${styles.mobileMenuOverlay} ${menuOpen ? styles.mobileMenuOverlayOpen : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <button 
          className={styles.mobileCloseBtn}
          onClick={() => setMenuOpen(false)}
          aria-label="Close Menu"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className={styles.mobileNavLinks}>
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={pathname === link.href ? styles.active : ''}
              style={{ transitionDelay: '0.1s' }}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/my-orders" className={pathname === '/my-orders' ? styles.active : ''} style={{ transitionDelay: '0.2s' }}>MY ORDERS</Link>
          )}

          <Link 
            href="/wishlist" 
            className={`${styles.mobileMenuLink} ${pathname === '/wishlist' ? styles.active : ''}`}
            style={{ transitionDelay: '0.25s' }}
          >
            WISHLIST {wishlistCount > 0 && <span className={styles.mobileBadge}>{wishlistCount}</span>}
          </Link>

          <div 
            className={styles.mobileMenuLink} 
            onClick={() => { setIsCartOpen(true); setMenuOpen(false); }}
            style={{ transitionDelay: '0.3s', cursor: 'pointer' }}
          >
            SHOPPING CART {cartCount > 0 && <span className={styles.mobileBadge}>{cartCount}</span>}
          </div>

          {!isAuthenticated && (
             <Link href="/my-orders" className={styles.mobileMenuLink} style={{ transitionDelay: '0.35s' }}>MY ORDERS</Link>
          )}
          
          {user?.role === 'admin' && (
            <Link href="/admin" className={pathname.startsWith('/admin') ? styles.active : ''} style={{ transitionDelay: '0.4s' }}>ADMIN PANEL</Link>
          )}
        </div>

        <div className={styles.mobileUserSection}>
          {isAuthenticated ? (
            <div className={styles.mobileWelcome}>
              AUTHENTICATED PRACTITIONER:
              <span className={styles.mobileUserName}>{user?.name.toUpperCase()}</span>
              <button 
                onClick={() => { logout(); setMenuOpen(false); }} 
                className={`${styles.mobileLogoutBtn} btnPremium btnPremiumGlass`}
                style={{ width: '100%', marginTop: '20px' }}
              >
                LOGOUT FROM VAULT
              </button>
            </div>
          ) : (
            <Link 
              href="/auth/register" 
              className={`${styles.mobileLoginBtn} btnPremium btnPremiumGold`}
              style={{ width: '100%' }}
            >
              SIGN IN / REGISTER
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
