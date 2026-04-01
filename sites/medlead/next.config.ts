import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@material-symbols-svg/react'],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Directus CMS - add your production hostname here
      // For production, replace with your actual Directus domain
      {
        protocol: 'https',
        hostname: '*.directus.app',
      },
      {
        protocol: 'https',
        hostname: 'directus.falwo.fr',
      },
      {
        protocol: 'https',
        hostname: 'cms.drlogist.com',
      },
      // Development only - remove in production if not needed
      ...(process.env.NODE_ENV === 'development' ? [
        { protocol: 'http' as const, hostname: 'localhost' },
        { protocol: 'http' as const, hostname: '209.38.216.215' },
      ] : []),
    ],
  },
  async redirects() {
    return [
      { source: '/blog', destination: '/resources', permanent: true },
      { source: '/blog/:path*', destination: '/resources/:path*', permanent: true },
    ];
  },
  turbopack: {},
  webpack: (config) => {
    // Ignore problematic modules during build
    config.externals = config.externals || [];
    config.externals.push({
      '@libsql/linux-x64-gnu': 'commonjs @libsql/linux-x64-gnu',
      '@libsql/linux-arm64-gnu': 'commonjs @libsql/linux-arm64-gnu',
      'esbuild': 'commonjs esbuild',
    });
    return config;
  },
};

export default nextConfig;
