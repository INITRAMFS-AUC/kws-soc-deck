import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Project page lives at https://initramfs-auc.github.io/kws-soc-deck/.
  // Override at build time with VITE_BASE=/ for root/org-page deployments.
  base: process.env.VITE_BASE ?? '/kws-soc-deck/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
