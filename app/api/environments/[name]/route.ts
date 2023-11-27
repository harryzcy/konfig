import { TTL } from '@/src/constants'
import { parseKey, parseEnvironmentValue } from '@/src/parse'
import { getLastPathname } from '@/src/request'
import {
  errorResponse,
  jsonResponse,
  notFoundResponse,
  successResponse
} from '@/src/response'
import { getUnixTimestamp } from '@/src/time'
import type { Env, EnvironmentMetadata, Key, Environment } from '@/src/types'

export const runtime = 'edge'

export async function GET(req: Request) {
  console.log('Handling GET request')
  let name: Key
  try {
    const rawName = getLastPathname(req.url, 'environment name')

    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env
  const key = `env:${name}`

  console.log('Fetching key ' + name + ' from KV')
  const { value: raw, metadata } =
    await CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse()
  }
  console.log(`Found key ${key} in KV`)

  const value = parseEnvironmentValue(raw)
  const env = {
    name,
    metadata,
    ...value
  } as Environment

  return jsonResponse(env)
}

// Hard delete
export async function DELETE(req: Request) {
  console.log('Handling DELETE request')

  let name: Key
  try {
    const rawName = getLastPathname(req.url, 'environment name')

    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env
  const key = `env:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
  if (raw === null) {
    console.log(73)
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse()
  }
  if (metadata?.deleted === undefined) {
    console.log(`Key ${key} is not soft deleted`)
    return errorResponse(new Error(`Environment ${name} is not soft deleted`))
  }
  const now = getUnixTimestamp()
  if (metadata.deleted + TTL > now) {
    console.log(`Key ${key} is soft deleted within TTL`)
    return errorResponse(
      new Error(`Environment ${name} is soft deleted within TTL`)
    )
  }

  const { groups } = parseEnvironmentValue(raw)
  if (groups.length > 0) {
    console.log(`Key ${key} has groups`)
    return errorResponse(new Error(`Environment ${name} has groups`))
  }

  console.log(`Deleting key ${key} from KV`)
  await CONFIG_KV.delete(key)
  console.log(`Deleted key ${key} from KV`)

  return successResponse()
}
