import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      // Node's own native Web Storage global (on by default since Node 22.4, stable in 26)
      // shadows jsdom's window.localStorage in the test worker, leaving it undefined.
      // Disable it so jsdom's localStorage/sessionStorage work as expected.
      execArgv: ['--no-experimental-webstorage'],
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'https://localhost:7118',
          changeOrigin: true,
          secure: false, // allow self-signed certificates in dev
        },
        '/hubs': {
          target: env.VITE_API_TARGET || 'https://localhost:7118',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
