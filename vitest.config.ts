import { cloudflareTest } from '@cloudflare/vitest-pool-workers'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        kvNamespaces: ['CONFIG_KV']
      }
    })
  ],
  test: {
    globals: true,
    coverage: {
      provider: 'istanbul'
    },
    typecheck: {
      enabled: true,
      tsconfig: 'tsconfig.test.json'
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
