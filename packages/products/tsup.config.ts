import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/components/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: true,
  clean: true,
  external: ['react', 'next', '@directus/sdk', '@directus-cms/core'],
});
