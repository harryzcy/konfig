import { cloudflare } from '@cloudflare/vite-plugin'
import build from '@hono/vite-build/cloudflare-workers'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  const resolve = {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }

  if (command === 'serve') {
    return {
      ssr: {
        external: ['react', 'react-dom']
      },
      build: {
        manifest: false
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
      resolve
    }
  }

  if (mode === 'client') {
    return {
      build: {
        manifest: true,
        rollupOptions: {
          input: ['./src/style.css'],
          output: {
            assetFileNames: 'assets/[name].[ext]'
          }
        }
      },
      resolve
    }
  }

  return {
    // ssr: {
    //   external: ['react', 'react-dom']
    // },
    plugins: [
      build({
        entry: 'src/index.tsx',
        outputDir: 'dist-server'
      }),
      react(),
      tailwindcss(),
      cloudflare()
    ],
    resolve
  }
})
