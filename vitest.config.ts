import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineWorkersConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    coverage: {
      provider: 'istanbul'
    },
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          kvNamespaces: ['CONFIG_KV']
        }
      }
    },
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.test.json'
    }
  },
  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname
    }
  }
})
