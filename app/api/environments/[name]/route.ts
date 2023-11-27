import { parseKey, parseEnvironmentValue } from '@/src/parse'
import { getLastPathname } from '@/src/request'
import {
  errorResponse,
  jsonResponse,
  notFoundResponse,
  successResponse
} from '@/src/response'
import type { Env, EnvironmentMetadata, Key, Environment } from '@/src/types'

export const runtime = 'edge'

export async function GET(req: Request) {
  console.log('Handling GET request')
  let name: Key
  try {
    const url = new URL(req.url)
    const rawName = url.pathname.split('/').pop() || ''
    if (rawName === '') {
      throw new Error('invalid input: environment name is not defined')
    }
    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env
  const key = `env:${name}`

  console.log('Fetching key ' + name + ' from KV')
  const { value: raw, metadata } =
    await CONFIG_KV.getWithMetadata<EnvironmentMetadata>(name)
  if (raw === null) {
    console.log(`Key ${key} not found in KV`)
    return notFoundResponse()
  }
  console.log(`Found key ${key} in KV`)

  const value = parseEnvironmentValue(raw)
  const env = {
    key,
    metadata,
    ...value
  } as Environment

  return jsonResponse(env)
}

// Hard delete
export async function DELETE(req: Request) {
  console.log('Handling DELETE request')

  let name: Key
  try {
    const rawName = getLastPathname(req.url, 'environment name')

    console.log('Received request for environment name:', rawName)
    name = parseKey(rawName)
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const { CONFIG_KV } = process.env as unknown as Env
  const key = `env:${name}`

  console.log(`Deleting key ${key} from KV`)

  await CONFIG_KV.delete(key)
  console.log(`Deleted key ${key} from KV`)

  return successResponse()
}
