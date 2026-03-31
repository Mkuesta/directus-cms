import { defineConfig } from 'tsup';

export default defineConfig([
  // Server-side code (types, auth, api handler)
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: true,
    clean: true,
    external: ['react', 'react-dom', 'next', 'next/server', 'next/headers', '@directus/sdk', 'marked'],
  },
  // Client components (need 'use client' banner)
  {
    entry: ['src/components/index.ts'],
    outDir: 'dist/components',
    format: ['esm'],
    dts: true,
    splitting: false,
    banner: { js: '"use client";' },
    external: ['react', 'react-dom', 'next', 'next/navigation', 'next/link', '@directus/sdk', 'marked'],
  },
]);
