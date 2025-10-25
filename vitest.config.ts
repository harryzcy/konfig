import {
  buildPagesASSETSBinding,
  defineWorkersConfig
} from '@cloudflare/vitest-pool-workers/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import tsconfigPaths from 'vite-tsconfig-paths'

const assetsPath = path.join(__dirname, 'public')

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
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          kvNamespaces: ['CONFIG_KV'],
          serviceBindings: {
            ASSERTS: await buildPagesASSETSBinding(assetsPath)
          }
        }
      }
    },
    projects: [
      {
        // Vite code
        test: {
          include: ['src/*.test.ts', 'src/**/*.test.ts'],
          environment: 'jsdom',
          pool: 'forks',
          setupFiles: ['./jest-setup.ts']
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
