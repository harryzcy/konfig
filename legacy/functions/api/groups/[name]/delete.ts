import { parseKey } from '@/common/parse'
import { getNthLastPathname } from '@/common/request'
import {
  errorResponse,
  notFoundResponse,
  successResponse
} from '@/common/response'
import { getUnixTimestamp } from '@/common/time'
import type { Env, GroupMetadata, Key } from '@/common/types'

// Soft delete
export const onRequestPost: PagesFunction<Env> = async (context) => {
  // url is /api/groups/[name]/delete
  console.log('Handling POST request')

  let name: Key
  try {
    const rawName = getNthLastPathname(context.request.url, 1, 'group name')

    console.log('Received request for group name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const key = `group:${name}`

  // query key
  console.log('Fetching key ' + key + ' from KV')
  const { value: raw, metadata } =
    await context.env.CONFIG_KV.getWithMetadata<GroupMetadata>(key)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse()
  }
  if (metadata?.deleted !== undefined) {
    console.log(`Key ${key} is already soft deleted`)
    return errorResponse(new Error(`Group ${name} is already soft deleted`))
  }

  // check if keys are emptied
  const resp = await context.env.CONFIG_KV.list({ prefix: `entry:${name}:` })
  if (resp.keys.length > 0) {
    console.log(`Key with prefix entry:${name}: still has keys`)
    return errorResponse(new Error(`Group ${name} still has keys`))
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
