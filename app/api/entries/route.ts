import { parseConfigEntry } from '@/src/parse'
import { errorResponse, successResponse } from '@/src/response'
import type { ConfigEntry, ConfigValue, Env } from '@/src/types'

export const runtime = 'edge'

export async function POST(req: Request) {
  console.log('Handling POST request')

  let entry: ConfigEntry
  try {
    entry = parseConfigEntry(await req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env

  const value = {
    type: entry.type,
    value: entry.value
  } as ConfigValue

  console.log(`Storing key entry:${entry.key} in KV`)
  await CONFIG_KV.put(`entry:${entry.key}`, JSON.stringify(value))
  console.log(`Stored key entry:${entry.key} in KV`)

  return successResponse()
}
