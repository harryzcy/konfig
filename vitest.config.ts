import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'miniflare',
    environmentOptions: {
      kvNamespaces: ['CONFIG_KV']
    }
  }
})
