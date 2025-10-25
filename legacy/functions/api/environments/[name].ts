import { TTL } from '@/common/constants'
import { parseKey, parseEnvironmentValue } from '@/common/parse'
import { getLastPathname } from '@/common/request'
import {
  errorResponse,
  jsonResponse,
  notFoundResponse,
  successResponse
} from '@/common/response'
import { getUnixTimestamp } from '@/common/time'
import type { Env, EnvironmentMetadata, Key, Environment } from '@/common/types'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  console.log('Handling GET request')
  let name: Key
  try {
    const rawName = getLastPathname(context.request.url, 'environment name')

    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const key = `env:${name}`

  console.log('Fetching key ' + name + ' from KV')
  const { value: raw, metadata } =
    await context.env.CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
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
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  console.log('Handling DELETE request')

  let name: Key
  try {
    const rawName = getLastPathname(context.request.url, 'environment name')

    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const key = `env:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await context.env.CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
  if (raw === null) {
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
  await context.env.CONFIG_KV.delete(key)
  console.log(`Deleted key ${key} from KV`)

  return successResponse()
}
