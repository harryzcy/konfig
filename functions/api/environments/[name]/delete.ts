import { parseKey, parseEnvironmentValue } from '@/common/parse'
import { getNthLastPathname } from '@/common/request'
import {
  errorResponse,
  notFoundResponse,
  successResponse
} from '@/common/response'
import { getUnixTimestamp } from '@/common/time'
import type { Env, EnvironmentMetadata, Key } from '@/common/types'

// Soft delete
export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log('Handling POST request')

  let name: Key
  try {
    // url is /api/environments/[name]/delete
    const rawName = getNthLastPathname(
      context.request.url,
      1,
      'environment name'
    )

    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const key = `env:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await context.env.CONFIG_KV.getWithMetadata<EnvironmentMetadata>(key)
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
  await context.env.CONFIG_KV.put(key, raw, {
    metadata: {
      ...metadata,
      deleted: getUnixTimestamp()
    }
  })
  console.log(`Marked key ${key} as soft deleted`)

  return successResponse()
}
