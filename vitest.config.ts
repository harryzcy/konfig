import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineWorkersConfig({
  plugins: [react()],
  test: {
    globals: true,
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.toml'
        },
        miniflare: {
          kvNamespaces: ['CONFIG_KV']
        }
      }
    },
    include: ['functions/**/*.test.ts', 'functions/**/*.test.tsx']
    // include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  }
})
