import { ContextWithBindings } from '../common/bindings'
import { parseConfigEntry } from '../common/parse'
import { errorResponse, successResponse } from '../common/response'
import { ConfigEntry, ConfigValue } from '../common/types'

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
