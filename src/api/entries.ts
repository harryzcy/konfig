import { ContextWithBindings } from '../common/bindings'
import { parseConfigEntry, parseConfigValue, parseKey } from '../common/parse'
import {
  errorResponse,
  notFoundResponse,
  successResponse
} from '../common/response'
import { ConfigEntry, ConfigValue, Key } from '../common/types'

export const entriesPost = async (c: ContextWithBindings) => {
  console.log('Handling POST request for entries')

  let entry: ConfigEntry
  try {
    entry = parseConfigEntry(await c.req.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  const value = {
    type: entry.type,
    value: entry.value
  } as ConfigValue

  console.log(`Storing key entry:${entry.key} in KV`)
  await c.env.CONFIG_KV.put(`entry:${entry.key}`, JSON.stringify(value))
  console.log(`Stored key entry:${entry.key} in KV`)

  return successResponse(c)
}

export const entryGet = async (c: ContextWithBindings) => {
  console.log('Handling GET request for an entry')

  let key: Key
  try {
    const rawKey = c.req.param('key')
    console.log('Received request for key:', rawKey)
    key = parseKey(rawKey)
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  console.log('Fetching key entry:' + key + ' from KV')
  const raw = await c.env.CONFIG_KV.get(`entry:${key}`)
  if (raw === null) {
    console.log(`Key entry:${key} not found in KV`)
    return notFoundResponse(c)
  }
  console.log(`Found key entry:${key} in KV`)

  const value = parseConfigValue(raw)
  const entry = { ...value, key } as ConfigEntry
  console.log(`Returning key entry:${key} from KV`)

  return c.json(entry)
}

export const entryHardDelete = async (c: ContextWithBindings) => {
  console.log('Handling DELETE request')

  let key: Key
  try {
    const rawKey = c.req.param('key')
    console.log('Received request for key:', rawKey)
    key = parseKey(rawKey)
  } catch (e) {
    const error = e as Error
    return errorResponse(c, error)
  }

  console.log(`Deleting key entry:${key} from KV`)
  await c.env.CONFIG_KV.delete(`entry:${key}`)
  console.log(`Deleted key entry:${key} from KV`)

  return successResponse(c)
}
