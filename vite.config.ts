import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  // Use absolute asset paths so deep links work on Vercel SPA rewrites
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
    build: {
      target: 'esnext',
      outDir: 'dist',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Separate out some larger libraries
              if (id.includes('@radix-ui') || id.includes('lucide-react')) {
                return 'ui';
              }
              if (id.includes('@supabase')) {
                return 'supabase';
              }
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom')) {
                return 'react-vendor';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    server: {
      port: 3000,
    },
  });