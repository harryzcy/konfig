import { ContextWithBindings } from '@/common/bindings'
import { TTL } from '@/common/constants'
import {
  parseEnvironmentValue,
  parseKey,
  parseNewEnvironmentRequest
} from '@/common/parse'
import {
  errorResponse,
  notFoundResponse,
  successResponse
} from '@/common/response'
import { getUnixTimestamp } from '@/common/time'
import {
  Environment,
  EnvironmentMetadata,
  EnvironmentValue,
  Key,
  NewEnvironmentRequest
} from '@/common/types'

export const environmentsGet = async (c: ContextWithBindings) => {
  console.log('Handling GET request for environments')

  const prefix = 'env:'
  console.log(`Getting key with prefix ${prefix} from KV`)
  const value = await c.env.CONFIG_KV.list<EnvironmentMetadata>({
    prefix
  })
  console.log(`Got key with prefix ${prefix} from KV`)

  const environments = value.keys.map((key) => key.name.replace(prefix, ''))

  return c.json({ environments })
}

export const environmentsPost = async (c: ContextWithBindings) => {
  console.log('Handling POST request for environments')

  let env: NewEnvironmentRequest
  try {
    env = parseNewEnvironmentRequest(await c.req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `env:${env.name}`
  const value = {
    groups: []
  } as EnvironmentValue
  const metadata = {
    created: getUnixTimestamp()
  } as EnvironmentMetadata

  console.log(`Storing key ${key} in KV`)
  await c.env.CONFIG_KV.put(key, JSON.stringify(value), {
    metadata
  })
  console.log(`Stored key ${key} in KV`)

  return successResponse(c)
}

export const environmentGet = async (c: ContextWithBindings) => {
  console.log('Handling GET request for a specific environment')
  let name: Key
  try {
    const rawName = c.req.param('name')
    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `env:${name}`

  console.log('Fetching key ' + name + ' from KV')
  const { value: raw, metadata } =
    await c.env.CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse(c)
  }
  console.log(`Found key ${key} in KV`)

  const value = parseEnvironmentValue(raw)
  const env = {
    name,
    metadata,
    ...value
  } as Environment

  return c.json(env)
}

// Hard delete
export const environmentHardDelete = async (c: ContextWithBindings) => {
  console.log('Handling DELETE request for a specific environment')

  let name: Key
  try {
    const rawName = c.req.param('name')

    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `env:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await c.env.CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse(c)
  }
  if (metadata?.deleted === undefined) {
    console.log(`Key ${key} is not soft deleted`)
    return errorResponse(
      c,
      new Error(`Environment ${name} is not soft deleted`)
    )
  }
  const now = getUnixTimestamp()
  if (metadata.deleted + TTL > now) {
    console.log(`Key ${key} is soft deleted within TTL`)
    return errorResponse(
      c,
      new Error(`Environment ${name} is soft deleted within TTL`)
    )
  }

  const { groups } = parseEnvironmentValue(raw)
  if (groups.length > 0) {
    console.log(`Key ${key} has groups`)
    return errorResponse(c, new Error(`Environment ${name} has groups`))
  }

  console.log(`Deleting key ${key} from KV`)
  await c.env.CONFIG_KV.delete(key)
  console.log(`Deleted key ${key} from KV`)

  return successResponse(c)
}

// Soft delete.
// url is /api/environments/[name]/delete
export const environmentSoftDelete = async (c: ContextWithBindings) => {
  console.log('Handling POST request')

  let name: Key
  try {
    const rawName = c.req.param('name')
    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `env:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await c.env.CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse(c)
  }
  if (metadata?.deleted !== undefined) {
    console.log(`Key ${key} is already soft deleted`)
    return errorResponse(
      c,
      new Error(`Environment ${name} is already soft deleted`)
    )
  }

  const { groups } = parseEnvironmentValue(raw)
  if (groups.length > 0) {
    console.log(`Key ${key} has groups`)
    return errorResponse(c, new Error(`Environment ${name} has groups`))
  }

  console.log(`Marking key ${key} as soft deleted`)
  await c.env.CONFIG_KV.put(key, raw, {
    metadata: {
      ...metadata,
      deleted: getUnixTimestamp()
    }
  })
  console.log(`Marked key ${key} as soft deleted`)

  return successResponse(c)
}
