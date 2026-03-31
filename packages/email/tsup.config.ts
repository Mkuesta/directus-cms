import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    clean: true,
    external: ['resend', '@directus/sdk'],
  },
  {
    entry: ['src/invoice.tsx'],
    format: ['esm'],
    dts: true,
    splitting: false,
    clean: false,
    external: ['resend', '@directus/sdk', '@react-pdf/renderer', 'react'],
  },
]);
