import { parseNewEnvironmentRequest } from '@/src/parse'
import { errorResponse, jsonResponse, successResponse } from '@/src/response'
import { getUnixTimestamp } from '@/src/time'
import type {
  Env,
  NewEnvironmentRequest,
  EnvironmentMetadata,
  EnvironmentValue
} from '@/src/types'

export const runtime = 'edge'

export async function GET(req: Request) {
  console.log('Handling GET request')

  const { CONFIG_KV } = process.env as unknown as Env

  const prefix = 'env:'
  console.log(`Getting key with prefix ${prefix} from KV`)
  const value = await CONFIG_KV.list<EnvironmentMetadata>({
    prefix
  })
  console.log(`Got key with prefix ${prefix} from KV`)

  const environments = value.keys.map((key) => key.name.replace(prefix, ''))

  return jsonResponse({
    environments: environments
  })
}

export async function POST(req: Request) {
  console.log('Handling POST request')

  let env: NewEnvironmentRequest
  try {
    env = parseNewEnvironmentRequest(await req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env
  const key = `env:${env.name}`
  const value = {
    groups: []
  } as EnvironmentValue
  const metadata = {
    created: getUnixTimestamp()
  } as EnvironmentMetadata

  console.log(`Storing key ${key} in KV`)
  await CONFIG_KV.put(key, JSON.stringify(value), {
    metadata
  })
  console.log(`Stored key ${key} in KV`)

  return successResponse()
}
