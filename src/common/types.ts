import { z } from 'zod'

export const Key = z.string().refine((value) => {
  return !value.includes(':')
}, 'key cannot contain ":"')
export type Key = z.infer<typeof Key>

export const Timestamp = z.number()
export const OptionalTimestamp = z.number().optional()

export const EnvironmentMetadata = z.object({
  created: Timestamp,
  deleted: OptionalTimestamp
})
export type EnvironmentMetadata = z.infer<typeof EnvironmentMetadata>

export const EnvironmentValue = z.object({
  groups: z.array(z.string())
})
export type EnvironmentValue = z.infer<typeof EnvironmentValue>

export const Environment = z.object({
  name: Key,
  metadata: EnvironmentMetadata,
  groups: z.array(z.string())
})
export type Environment = z.infer<typeof Environment>

export const NewEnvironmentRequest = z.object({
  name: Key
})
export type NewEnvironmentRequest = z.infer<typeof NewEnvironmentRequest>

export const GroupMetadata = z.object({
  created: Timestamp,
  deleted: OptionalTimestamp
})
export type GroupMetadata = z.infer<typeof GroupMetadata>

export const GroupValue = z.object({
  environments: z.array(z.string())
})
export type GroupValue = z.infer<typeof GroupValue>

export const Group = z.object({
  name: Key,
  metadata: GroupMetadata,
  environments: z.array(z.string())
})
export type Group = z.infer<typeof Group>

export const NewGroupRequest = z.object({
  name: Key
})
export type NewGroupRequest = z.infer<typeof NewGroupRequest>

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
