import { TTL } from '@/common/constants'
import { parseKey, parseGroupValue } from '@/common/parse'
import { getLastPathname } from '@/common/request'
import {
  errorResponse,
  jsonResponse,
  notFoundResponse,
  successResponse
} from '@/common/response'
import { getUnixTimestamp } from '@/common/time'
import type { Env, GroupMetadata, Key, Group } from '@/common/types'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  console.log('Handling GET request')
  let name: Key
  try {
    const rawName = getLastPathname(context.request.url, 'group name')

    console.log('Received request for group name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const key = `group:${name}`

  console.log('Fetching key ' + name + ' from KV')
  const { value: raw, metadata } =
    await context.env.CONFIG_KV.getWithMetadata<GroupMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse()
  }
  console.log(`Found key ${key} in KV`)

  const value = parseGroupValue(raw)
  const env = {
    name,
    metadata,
    ...value
  } as Group

  return jsonResponse(env)
}

// Hard delete
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  console.log('Handling DELETE request')

  let name: Key
  try {
    const rawName = getLastPathname(context.request.url, 'group name')

    console.log('Received request for group name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const key = `group:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await context.env.CONFIG_KV.getWithMetadata<GroupMetadata>(key)

  // check if key exists
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse()
  }

  // check if soft deleted
  if (metadata?.deleted === undefined) {
    console.log(`Key ${key} is not soft deleted`)
    return errorResponse(new Error(`Group ${name} is not soft deleted`))
  }

  // check TTL
  const now = getUnixTimestamp()
  if (metadata.deleted + TTL > now) {
    console.log(`Key ${key} is soft deleted within TTL`)
    return errorResponse(new Error(`Group ${name} is soft deleted within TTL`))
  }

  // check if keys are emptied
  const resp = await context.env.CONFIG_KV.list({ prefix: `entry:${name}:` })
  if (resp.keys.length > 0) {
    console.log(`Key with prefix entry:${name}: still has keys`)
    return errorResponse(new Error(`Group ${name} still has keys`))
  }

  // hard delete
  console.log(`Deleting key ${key} from KV`)
  await context.env.CONFIG_KV.delete(key)
  console.log(`Deleted key ${key} from KV`)

  return successResponse()
}
