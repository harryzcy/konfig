import { cloudflare } from '@cloudflare/vite-plugin'
import build from '@hono/vite-build/cloudflare-workers'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        manifest: true,
        assetsDir: 'static',
        rollupOptions: {
          input: './src/client.tsx',
          output: {
            dir: 'client-dist'
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src')
        }
      }
    }
  }

  return {
    ssr: {
      external: ['react', 'react-dom']
    },
    plugins: [
      build({
        entry: 'src/index.tsx'
      }),
      react(),
      tailwindcss(),
      cloudflare(),
      devServer({
        adapter,
        entry: 'src/index.tsx'
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
