import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['test/index.mts'],
  outDir: 'test/dist',
  tsconfig: 'test/tsconfig.json',
  clean: true,
  sourcemap: true
});