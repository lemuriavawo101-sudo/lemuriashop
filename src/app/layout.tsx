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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <Script 
          src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body style={{ position: 'relative' }}>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
