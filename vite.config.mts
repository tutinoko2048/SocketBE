import { defineConfig } from 'vite-plus';

export default defineConfig({
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
