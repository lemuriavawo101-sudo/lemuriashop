import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Cursor from "@/components/Cursor/Cursor";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar/Navbar";
import CheckoutDrawer from "@/components/Checkout/CheckoutDrawer";
import Footer from "@/components/Footer/Footer";
import { WishlistProvider } from "@/context/WishlistContext";
import { PerformanceProvider } from "@/context/PerformanceContext";
import GlobalCanvasWrapper from "@/components/ModelViewer/GlobalCanvasWrapper";

export const metadata: Metadata = {
  title: "LEMURIA | The Art of Blade",
  description: "Exquisite martial arts weaponry and heritage collectibles for the modern practitioner.",
  icons: {
    icon: '/favicon.svg',
  },
};

import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <Script 
          src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body style={{ position: 'relative' }}>
        <NextTopLoader 
          color="#BF953F" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px #BF953F,0 0 5px #BF953F"
        />
        <ThemeProvider>
          <PerformanceProvider>
            <ToastProvider>
              <AuthProvider>
                <CartProvider>
                  <WishlistProvider>
                    <SmoothScroll />
                    <Cursor />
                    <Navbar />
                    <CheckoutDrawer />
                    <ScrollToTop />
                     <main>{children}</main>
                     <Footer />
                     
                     <GlobalCanvasWrapper />
                    
                    {/* Cinematic Aesthetic Layers */}
                    <div className="lightLeak"></div>
                    <div className="noise"></div>
                  </WishlistProvider>
                </CartProvider>
              </AuthProvider>
            </ToastProvider>
          </PerformanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
