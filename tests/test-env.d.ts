import { Bindings } from './common/bindings'

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Bindings {
    CONFIG_KV: KVNamespace
  }
}
