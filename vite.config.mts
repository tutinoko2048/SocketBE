import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    include: ['test/**/*.test.mjs', 'test/**/*.test.mts'],
  },
  pack: {
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    exports: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    }
  }
})
