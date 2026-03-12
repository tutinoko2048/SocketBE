import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['index.mts'],
  outDir: './dist',
  format: 'esm',
  clean: true,
  sourcemap: true,
});
