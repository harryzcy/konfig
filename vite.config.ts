import { cloudflare } from '@cloudflare/vite-plugin'
import build from '@hono/vite-build/cloudflare-workers'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command, isSsrBuild }) => {
  if (command === 'serve') {
    return { plugins: [cloudflare(), tailwindcss()] }
  }
  if (!isSsrBuild) {
    return {
      build: {
        rollupOptions: {
          input: ['./src/style.css'],
          output: {
            assetFileNames: 'assets/[name].[ext]'
          }
        }
      },
      plugins: [tailwindcss()]
    }
  }
  return {
    plugins: [build({ outputDir: 'dist-server' }), tailwindcss()]
  }
})
