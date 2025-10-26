import { Bindings } from '../src/common/bindings'

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Bindings {}
}
