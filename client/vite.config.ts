import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from "svelte-preprocess";
import {mdsvex} from "mdsvex";


const svelteConfig = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  extensions: ['.svelte', '.md'],
  preprocess: [sveltePreprocess(), mdsvex({extensions: ['.md']})]
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(svelteConfig)],
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
