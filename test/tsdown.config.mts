import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['index.mts'],
  outDir: './dist',
  format: 'esm',
  tsconfig: './tsconfig.json',
  clean: true,
  sourcemap: true,
});
