import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineWorkersConfig({
  plugins: [react()],
  test: {
    globals: true,
    environmentOptions: {
      kvNamespaces: ['CONFIG_KV']
    },
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  }
})
