import { parseNewGroupRequest } from '@/common/parse'
import { errorResponse, jsonResponse, successResponse } from '@/common/response'
import { getUnixTimestamp } from '@/common/time'
import type {
  Env,
  NewGroupRequest,
  GroupMetadata,
  GroupValue
} from '@/common/types'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  console.log('Handling GET request')

  const prefix = 'group:'
  console.log(`Getting key with prefix ${prefix} from KV`)
  const value = await context.env.CONFIG_KV.list<GroupMetadata>({
    prefix
  })
  console.log(`Got key with prefix ${prefix} from KV`)

  const groups = value.keys.map((key) => key.name.replace(prefix, ''))

  return jsonResponse({
    groups
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log('Handling POST request')

  let env: NewGroupRequest
  try {
    env = parseNewGroupRequest(await context.request.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const key = `group:${env.name}`
  const value = {
    environments: []
  } as GroupValue
  const metadata = {
    created: getUnixTimestamp()
  } as GroupMetadata

  console.log(`Storing key ${key} in KV`)
  await context.env.CONFIG_KV.put(key, JSON.stringify(value), {
    metadata
  })
  console.log(`Stored key ${key} in KV`)

  return successResponse()
}
