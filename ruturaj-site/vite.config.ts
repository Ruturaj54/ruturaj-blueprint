import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Libraries and the prep tracker's JSON change far less often than the
        // app. Separate chunks mean a deploy only re-downloads the app code on
        // his phone, not React, Framer Motion or 280 curriculum items too.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
          if (id.includes('/src/data/amazon/') && id.endsWith('.json')) return 'tracker';
          return undefined;
        },
      },
    },
  },
});
