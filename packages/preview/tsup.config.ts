import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: true,
    clean: true,
    external: ['react', 'react-dom', 'next', 'next/server', 'next/headers', '@directus/sdk'],
  },
  {
    entry: ['src/components/index.ts'],
    outDir: 'dist/components',
    format: ['esm'],
    dts: true,
    splitting: false,
    banner: { js: '"use client";' },
    external: ['react', 'react-dom', 'next', 'next/navigation'],
  },
]);
