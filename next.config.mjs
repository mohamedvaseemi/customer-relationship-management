/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,

  // Performance: Optimise large package tree-shaking and module resolution
  experimental: {
    optimizePackageImports: [
      'react-icons', 
      'framer-motion', 
      'recharts', 
      'date-fns', 
      'lucide-react',
      '@headlessui/react',
      'clsx',
      'tailwind-merge'
    ],
  },


  // Security headers for every response
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Cache static assets for 1 year
        source: '/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Dev logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
