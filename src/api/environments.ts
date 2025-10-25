import { ContextWithBindings } from '../common/bindings'
import { parseNewEnvironmentRequest } from '../common/parse'
import { errorResponse, successResponse } from '../common/response'
import { getUnixTimestamp } from '../common/time'
import {
  EnvironmentMetadata,
  EnvironmentValue,
  NewEnvironmentRequest
} from '../common/types'

export const environmentsGet = async (c: ContextWithBindings) => {
  console.log('Handling GET request for environments')

  const prefix = 'env:'
  console.log(`Getting key with prefix ${prefix} from KV`)
  const value = await c.env.CONFIG_KV.list<EnvironmentMetadata>({
    prefix
  })
  console.log(`Got key with prefix ${prefix} from KV`)

  const environments = value.keys.map((key) => key.name.replace(prefix, ''))

  return c.json({ environments })
}

export const environmentsPost = async (c: ContextWithBindings) => {
  console.log('Handling POST request for environments')

  let env: NewEnvironmentRequest
  try {
    env = parseNewEnvironmentRequest(await c.req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const key = `env:${env.name}`
  const value = {
    groups: []
  } as EnvironmentValue
  const metadata = {
    created: getUnixTimestamp()
  } as EnvironmentMetadata

  console.log(`Storing key ${key} in KV`)
  await c.env.CONFIG_KV.put(key, JSON.stringify(value), {
    metadata
  })
  console.log(`Stored key ${key} in KV`)

  return successResponse(c)
}
