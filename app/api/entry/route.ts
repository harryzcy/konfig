import { parseConfigEntry } from '@/src/parse'
import type { ConfigEntry, Env } from '@/src/types'

export const runtime = 'edge'

export async function POST(req: Request) {
  const body = await req.json()

  let value: ConfigEntry
  try {
    value = parseConfigEntry(body)
  } catch (e) {
    return new Response('{"message":"invalid config entry"}', {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      status: 400
    })
  }

  const { CONFIG_KV } = process.env as unknown as Env

  const key = `entry:${value.key}`
  await CONFIG_KV.put(key, JSON.stringify(value))

  return new Response('{"message":"success"}', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  })
}
