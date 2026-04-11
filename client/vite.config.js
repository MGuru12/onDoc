import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Export the config
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  envDir: 'env',
});
