import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
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
