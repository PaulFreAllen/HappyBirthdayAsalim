import { defineConfig } from 'vite';

export default defineConfig({
  base: '/HappyBirthdayAsalim/',
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
