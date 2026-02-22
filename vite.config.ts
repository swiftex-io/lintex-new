
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss('./tailwind.config.js'),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  }
});
