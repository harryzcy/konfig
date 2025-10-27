import { cloudflare } from '@cloudflare/vite-plugin'
import devServer from '@hono/vite-dev-server'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'

export default defineConfig({
  ssr: {
    external: ['react', 'react-dom']
  },
  plugins: [
    tailwindcss(),
    cloudflare(),
    ssrPlugin(),
    devServer({
      entry: 'src/index.tsx'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
