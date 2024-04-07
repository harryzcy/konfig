import { parseNewEnvironmentRequest } from '@/src/parse'
import { errorResponse, successResponse } from '@/src/response'
import { getUnixTimestamp } from '@/src/time'
import type {
  Env,
  NewEnvironmentRequest,
  EnvironmentMetadata,
  EnvironmentValue
} from '@/src/types'

export const runtime = 'edge'

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
