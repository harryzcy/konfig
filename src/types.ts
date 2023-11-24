import { type KVNamespace } from '@cloudflare/workers-types'
import { z } from 'zod'

export const ConfigKey = z.string().refine((value) => {
  return !value.includes(':')
}, 'key cannot contain ":"')

export const ConfigValue = z.object({
  type: z.enum(['text', 'json', 'yaml']),
  value: z.string()
})

export const ConfigEntry = z.object({
  type: z.enum(['text', 'json', 'yaml']),
  key: ConfigKey,
  value: z.string()
})

export type ConfigEntry = z.infer<typeof ConfigEntry>
export type ConfigValue = z.infer<typeof ConfigValue>

export type Env = {
  CONFIG_KV: KVNamespace
}
