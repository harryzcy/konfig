import { parseNewGroupRequest } from '@/src/parse'
import { errorResponse, jsonResponse, successResponse } from '@/src/response'
import { getUnixTimestamp } from '@/src/time'
import type {
  Env,
  NewGroupRequest,
  GroupMetadata,
  GroupValue
} from '@/src/types'

export const runtime = 'edge'

export async function GET(req: Request) {
  console.log('Handling GET request')

  const { CONFIG_KV } = process.env as unknown as Env

  const prefix = 'group:'
  console.log(`Getting key with prefix ${prefix} from KV`)
  const value = await CONFIG_KV.list<GroupMetadata>({
    prefix
  })
  console.log(`Got key with prefix ${prefix} from KV`)

  const groups = value.keys.map((key) => key.name.replace(prefix, ''))

  return jsonResponse({
    groups
  })
}

export async function POST(req: Request) {
  console.log('Handling POST request')

  let env: NewGroupRequest
  try {
    env = parseNewGroupRequest(await req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env
  const key = `group:${env.name}`
  const value = {
    environments: []
  } as GroupValue
  const metadata = {
    created: getUnixTimestamp()
  } as GroupMetadata

  console.log(`Storing key ${key} in KV`)
  await CONFIG_KV.put(key, JSON.stringify(value), {
    metadata
  })
  console.log(`Stored key ${key} in KV`)

  return successResponse()
}
