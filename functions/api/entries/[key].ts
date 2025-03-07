import { parseKey, parseConfigValue } from '@/common/parse'
import { getLastPathname } from '@/common/request'
import {
  errorResponse,
  jsonResponse,
  notFoundResponse,
  successResponse
} from '@/common/response'
import type { ConfigEntry, Key, Env } from '@/common/types'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  console.log('Handling GET request')
  let key: Key
  try {
    const rawKey = getLastPathname(context.request.url, 'key')

    console.log('Received request for key:', rawKey)
    key = parseKey(rawKey)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  console.log('Fetching key entry:' + key + ' from KV')
  const raw = await context.env.CONFIG_KV.get(`entry:${key}`)
  if (raw === null) {
    console.log(`Key entry:${key} not found in KV`)
    return notFoundResponse()
  }
  console.log(`Found key entry:${key} in KV`)

  const value = parseConfigValue(raw)
  const entry = { ...value, key } as ConfigEntry
  console.log(`Returning key entry:${key} from KV`)

  return jsonResponse(entry)
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  console.log('Handling DELETE request')

  let key: Key
  try {
    const rawKey = getLastPathname(context.request.url, 'key')

    console.log('Received request for key:', rawKey)
    key = parseKey(rawKey)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  console.log(`Deleting key entry:${key} from KV`)
  await context.env.CONFIG_KV.delete(`entry:${key}`)
  console.log(`Deleted key entry:${key} from KV`)

  return successResponse()
}
