import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    // Remove proxy configuration for Netlify deployment
    // API calls will be handled by serverless functions
  },
  build: {
    // Ensure proper build output for Netlify
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@radix-ui/react-icons', '@radix-ui/react-slot'],
          charts: ['recharts'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    }
  }
});
