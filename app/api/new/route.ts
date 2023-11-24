import { ConfigEntry, Env } from '@/src/types'

export const runtime = 'edge'

export async function POST(req: Request) {
  const body = await req.json()
  const value = ConfigEntry.parse(body)

  const { CONFIG_KV } = process.env as unknown as Env

  const key = `entry:${value.key}`
  await CONFIG_KV.put(key, JSON.stringify(value))

  return new Response('{"message":"success"}', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  })
}
