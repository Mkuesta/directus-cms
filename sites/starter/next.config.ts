import type { NextConfig } from 'next';
import crypto from 'crypto';

// Generate a random sitemap slug per build (or use env var for persistence)
const SITEMAP_SLUG = process.env.SITEMAP_SLUG || `sm-${crypto.randomBytes(4).toString('hex')}.xml`;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.drlogist.com' },
      { protocol: 'https', hostname: '*.directus.app' },
    ],
  },
  async rewrites() {
    return [
      // Obfuscated sitemap — only this URL serves the sitemap
      { source: `/${SITEMAP_SLUG}`, destination: '/api/sitemap' },
    ];
  },
};

export default nextConfig;
