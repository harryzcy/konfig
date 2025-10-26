import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineWorkersConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    coverage: {
      provider: 'istanbul'
    },
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.test.json'
    },
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          kvNamespaces: ['CONFIG_KV']
        }
      }
    },
    projects: [
      {
        // Vite code
        test: {
          include: ['src/*.test.ts', 'src/**/*.test.ts'],
          environment: 'jsdom'
          // pool: 'forks'
          // setupFiles: ['./jest-setup.ts']
        },
        resolve: {
          alias: {
            '@': new URL('./src/', import.meta.url).pathname
          }
        }
      },
      {
        // Cloudflare Pages Functions code
        extends: true,
        test: {
          include: ['tests/*.test.ts', 'tests/**/*.test.ts']
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname
    }
  }
})
