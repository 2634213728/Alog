import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses with gzip
  compress: true,

  // Aggressively cache static assets in browser
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  experimental: {
    // Enable partial prerendering where possible
    ppr: false,
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      'react-markdown',
      'remark-gfm',
      'rehype-highlight',
    ],
  },
};

export default nextConfig;
