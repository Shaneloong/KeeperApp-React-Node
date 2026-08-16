import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/login': 'http://localhost:3000',
      '/register': 'http://localhost:3000',
      '/delete': 'http://localhost:3000',
      '/create': 'http://localhost:3000',
      '/notes': 'http://localhost:3000'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  }
});
