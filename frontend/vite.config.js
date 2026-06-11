import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Default to localhost:8000 — common for php artisan serve
  const target = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: '../backend/public',
      emptyOutDir: false,
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      proxy: {
        // Proxy central (SaaS admin) API calls to avoid CORS issues
        '/central-api': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/local-tenant-api': {
          target: target,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/local-tenant-api/, '/tenant-api'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (req.headers['x-tenant-domain']) {
                proxyReq.setHeader('Host', req.headers['x-tenant-domain']);
              }
            });
          }
        },
      },
    },
  };
})
