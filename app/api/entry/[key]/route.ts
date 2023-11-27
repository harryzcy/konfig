import { parseKey, parseConfigValue } from '@/src/parse'
import { getLastPathname } from '@/src/request'
import {
  errorResponse,
  jsonResponse,
  notFoundResponse,
  successResponse
} from '@/src/response'
import type { ConfigEntry, Key, Env } from '@/src/types'

export const runtime = 'edge'

export async function GET(req: Request) {
  console.log('Handling GET request')
  let key: Key
  try {
    const rawKey = getLastPathname(req.url, 'key')

    console.log('Received request for key:', rawKey)
    key = parseKey(rawKey)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env

  console.log('Fetching key entry:' + key + ' from KV')
  const raw = await CONFIG_KV.get(`entry:${key}`)
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

export async function DELETE(req: Request) {
  console.log('Handling DELETE request')

  let key: Key
  try {
    const rawKey = getLastPathname(req.url, 'key')

    console.log('Received request for key:', rawKey)
    key = parseKey(rawKey)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env

  console.log(`Deleting key entry:${key} from KV`)
  await CONFIG_KV.delete(`entry:${key}`)
  console.log(`Deleted key entry:${key} from KV`)

  return successResponse()
}
