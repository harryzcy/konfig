import { type KVNamespace } from '@cloudflare/workers-types'
import { z } from 'zod'

export const Key = z.string().refine((value) => {
  return !value.includes(':')
}, 'key cannot contain ":"')
export type Key = z.infer<typeof Key>

export const EnvironmentName = Key
export type EnvironmentName = z.infer<typeof EnvironmentName>

export const EnvironmentMetadata = z.object({
  created: z.number(), // unix timestamp
  deleted: z.number().optional() // unix timestamp
})
export type EnvironmentMetadata = z.infer<typeof EnvironmentMetadata>

export const EnvironmentValue = z.object({
  groups: z.array(z.string())
})
export type EnvironmentValue = z.infer<typeof EnvironmentValue>

export const Environment = z.object({
  key: Key,
  metadata: EnvironmentMetadata,
  groups: z.array(z.string())
})
export type Environment = z.infer<typeof Environment>

export const NewEnvironmentRequest = z.object({
  name: EnvironmentName
})
export type NewEnvironmentRequest = z.infer<typeof NewEnvironmentRequest>

export const ConfigValue = z.object({
  type: z.enum(['text', 'json', 'yaml']),
  value: z.string()
})

export const ConfigEntry = z.object({
  type: z.enum(['text', 'json', 'yaml']),
  key: Key,
  value: z.string()
})

export type ConfigEntry = z.infer<typeof ConfigEntry>
export type ConfigValue = z.infer<typeof ConfigValue>

export type Env = {
  CONFIG_KV: KVNamespace
}
