import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  clean: true,
  external: ['@mkuesta/core', '@directus/sdk', 'vitest'],
});
