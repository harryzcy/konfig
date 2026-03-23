import { Bindings } from '../src/common/bindings'
import { KVNamespace } from '@cloudflare/workers-types/experimental'

declare module 'cloudflare:workers' {
  interface ProvidedEnv extends Bindings {
    CONFIG_KV: KVNamespace
  }
}
