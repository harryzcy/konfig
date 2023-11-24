import { parseConfigEntry } from '@/src/parse'
import { errorResponse, successResponse } from '@/src/response'
import type { ConfigEntry, Env } from '@/src/types'

export const runtime = 'edge'

export async function POST(req: Request) {
  const body = await req.json()

  let value: ConfigEntry
  try {
    value = parseConfigEntry(body)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env

  const key = `entry:${value.key}`
  await CONFIG_KV.put(key, JSON.stringify(value))

  return successResponse()
}
