import { parseConfigKey, parseConfigValue } from '@/src/parse'
import type { ConfigEntry, ConfigKey, Env } from '@/src/types'
import { NextApiRequest } from 'next'

export const runtime = 'edge'

export async function GET(req: NextApiRequest) {
  let key: ConfigKey
  try {
    key = parseConfigKey(req.query.key as string)
  } catch (e) {
    const error = e as Error
    return new Response(
      JSON.stringify({
        message: error.message
      }),
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        status: 400
      }
    )
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

  return new Response(JSON.stringify(entry), {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  })
}

export async function DELETE(req: NextApiRequest) {
  let key: ConfigKey
  try {
    key = parseConfigKey(req.query.key as string)
  } catch (e) {
    const error = e as Error
    return new Response(
      JSON.stringify({
        message: error.message
      }),
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        status: 400
      }
    )
  }

  const { CONFIG_KV } = process.env as unknown as Env

  await CONFIG_KV.delete(`entry:${key}`)

  return new Response('{"message":"success"}', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  })
}
