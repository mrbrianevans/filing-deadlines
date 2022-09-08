import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: { exclude: ["svelte-navigator"] },
  server: {
    proxy: {
      // for development proxy api request to caddy running on localhost
      '/api': {
        target: 'http://localhost'
      }
    }
  }
})
