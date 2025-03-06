import { parseNewEnvironmentRequest } from '@/common/parse'
import type {
  Env,
  NewEnvironmentRequest,
  EnvironmentMetadata,
  EnvironmentValue
} from '@/common/types'
import { errorResponse, jsonResponse, successResponse } from '@/response'
import { getUnixTimestamp } from '@/time'

export const onRequestGet: PagesFunction<Env> = async (context) => {
  console.log('Handling GET request')

  const prefix = 'env:'
  console.log(`Getting key with prefix ${prefix} from KV`)
  const value = await context.env.CONFIG_KV.list<EnvironmentMetadata>({
    prefix
  })
  console.log(`Got key with prefix ${prefix} from KV`)

  const environments = value.keys.map((key) => key.name.replace(prefix, ''))

  return jsonResponse({
    environments: environments
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log('Handling POST request')

  let env: NewEnvironmentRequest
  try {
    env = parseNewEnvironmentRequest(await context.request.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const key = `env:${env.name}`
  const value = {
    groups: []
  } as EnvironmentValue
  const metadata = {
    created: getUnixTimestamp()
  } as EnvironmentMetadata

  console.log(`Storing key ${key} in KV`)
  await context.env.CONFIG_KV.put(key, JSON.stringify(value), {
    metadata
  })
  console.log(`Stored key ${key} in KV`)

  return successResponse()
}
