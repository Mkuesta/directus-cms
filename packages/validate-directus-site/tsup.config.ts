import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: false,
    splitting: false,
    clean: true,
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    entry: ['src/lib.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    clean: false,
  },
]);
