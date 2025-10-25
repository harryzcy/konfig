import { Env } from '@/common/types'

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env {}
}
