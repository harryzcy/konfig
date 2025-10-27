import { cloudflare } from '@cloudflare/vite-plugin'
import devServer from '@hono/vite-dev-server'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    external: ['react', 'react-dom']
  },
  plugins: [
    react(),
    tailwindcss(),
    cloudflare(),
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
