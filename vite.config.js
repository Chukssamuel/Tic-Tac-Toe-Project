import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the production build works from any URL,
  // including GitHub Pages project sites (https://user.github.io/repo/).
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    strictPort: true,
    allowedHosts: ['.e2b.app', 'localhost'],
  },
});
