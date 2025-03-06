import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineWorkersConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    coverage: {
      provider: 'istanbul'
    },

    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.test.json'
    },
    // setupFiles: ['./jest-setup.ts'],
    workspace: [
      {
        extends: true,
        test: {
          include: ['tests/*.test.ts', 'tests/**/*.test.ts'],
          poolOptions: {
            workers: {
              wrangler: { configPath: './wrangler.toml' },
              miniflare: {
                kvNamespaces: ['CONFIG_KV']
              }
            }
          }
        }
      }
      // {
      //   extends: true,
      //   test: {
      //     include: ['tests/**/*.{node}.test.{ts,js}'],
      //     environment: 'jsdom'
      //   }
      // }
    ]
  },
  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname
    }
  }
})
