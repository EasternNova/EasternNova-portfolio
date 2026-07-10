// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Don't inline assets — keep them as files for large PNGs
    assetsInlineLimit: 0,
  },

  server: {
    port: 3000,
    open: true,
  },
});
