import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  allowedDevOrigins: ['192.168.0.3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75],
  },
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
      'react-icons/fi',
      '@react-three/drei',
      'three'
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Permissions-Policy', value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=()' },
        ],
      },
      {
        source: '/(fonts|images|artifacts)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  productionBrowserSourceMaps: false, // Turned off to save bundle size in prod
};

export default nextConfig;
