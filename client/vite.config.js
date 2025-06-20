import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Export the config
export default defineConfig(({ mode }) => {
  console.log(mode);
  
  // Manually load from the "env" directory
  const env = loadEnv(mode, path.resolve(__dirname, 'env'));

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env': env, // needed if using `process.env.VITE_*` in code
    },
  };
});
