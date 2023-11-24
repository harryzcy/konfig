import { parseConfigKey, parseConfigValue } from '@/src/parse'
import { errorResponse, jsonResponse, successResponse } from '@/src/response'
import type { ConfigEntry, ConfigKey, Env } from '@/src/types'

export const runtime = 'edge'

export async function GET(req: Request) {
  console.log('Handling GET request')
  let key: ConfigKey
  try {
    const url = new URL(req.url)
    const rawKey = url.pathname.split('/').pop()
    if (rawKey === undefined) {
      throw new Error('invalid input: key is undefined')
    }
    console.log('Received request for key:', rawKey)
    key = parseConfigKey(rawKey)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env

  const raw = await CONFIG_KV.get(`entry:${key}`)
  if (raw === null) {
    return new Response('{"message":"not found"}', {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      status: 404
    })
  }

  const value = parseConfigValue(raw)
  const entry = { ...value, key } as ConfigEntry

  return jsonResponse(entry)
}

export async function DELETE(req: Request) {
  console.log('Handling DELETE request')

  let key: ConfigKey
  try {
    const url = new URL(req.url)
    const rawKey = url.pathname.split('/').pop()
    if (rawKey === undefined) {
      throw new Error('invalid input: key is undefined')
    }
    console.log('Received request for key:', rawKey)
    key = parseConfigKey(rawKey)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env

  await CONFIG_KV.delete(`entry:${key}`)

  return successResponse()
}
