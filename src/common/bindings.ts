import { Context } from 'hono'

export interface Bindings {
  CONFIG_KV: KVNamespace
}

export type ContextWithBindings = Context<{ Bindings: Bindings }>
