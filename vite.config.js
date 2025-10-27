import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Configuration to fix Algorand SDK (and its dependencies) in the browser
  resolve: {
    alias: {
      // ⚠️ IMPORTANT: Alias 'process' and 'buffer' for browser compatibility
      process: 'process/browser',
      buffer: 'buffer',
      // Optional polyfills that might be needed by some algosdk dependencies
      stream: 'stream-browserify',
      util: 'util',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global shims required for algosdk's dependencies (e.g., bn.js)
      define: {
        global: 'globalThis', // Fixes "global is not defined"
      },
      plugins: [
        // Fixes "Module 'buffer' has been externalized"
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
})
