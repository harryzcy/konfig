import { parseKey, parseEnvironmentValue } from '@/src/parse'
import { getNthLastPathname } from '@/src/request'
import {
  errorResponse,
  notFoundResponse,
  successResponse
} from '@/src/response'
import { getUnixTimestamp } from '@/src/time'
import type { Env, EnvironmentMetadata, Key, Environment } from '@/src/types'

export const runtime = 'edge'

// Soft delete
export async function POST(req: Request) {
  console.log('Handling POST request')

  let name: Key
  try {
    // url is /api/environments/[name]/delete
    const rawName = getNthLastPathname(req.url, 1, 'environment name')

    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env
  const key = `env:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse()
  }
  if (metadata?.deleted !== undefined) {
    console.log(`Key ${key} is already soft deleted`)
    return errorResponse(
      new Error(`Environment ${name} is already soft deleted`)
    )
  }

  const { groups } = parseEnvironmentValue(raw)
  if (groups.length > 0) {
    console.log(`Key ${key} has groups`)
    return errorResponse(new Error(`Environment ${name} has groups`))
  }

  console.log(`Marking key ${key} as soft deleted`)
  await CONFIG_KV.put(key, raw, {
    metadata: {
      ...metadata,
      deleted: getUnixTimestamp()
    }
  })
  console.log(`Marked key ${key} as soft deleted`)

  return successResponse()
}
