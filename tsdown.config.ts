import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  minify: true,
  format: ['esm', 'cjs'],
  tsconfig: 'tsconfig.tsdown.json'
});
