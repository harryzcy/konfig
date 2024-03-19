import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineWorkersConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'miniflare',
    environmentOptions: {
      kvNamespaces: ['CONFIG_KV']
    },
    include: ['functions/**/*.test.ts', 'functions/**/*.test.tsx']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  }
})
