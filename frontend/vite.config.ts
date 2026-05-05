import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));
const tailwindConfig = fileURLToPath(new URL('./tailwind.config.js', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  root: frontendRoot,
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss({ config: tailwindConfig }), autoprefixer()],
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
