import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: true,
    clean: false,
    external: ['react', 'react-dom', 'stripe', '@directus/sdk', '@supabase/supabase-js', 'jose'],
  },
  {
    entry: ['src/components/index.ts'],
    outDir: 'dist/components',
    format: ['esm'],
    dts: true,
    splitting: false,
    banner: { js: '"use client";' },
    external: ['react', 'react-dom'],
  },
]);
