import { Env } from '@/types'

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env {}
}
