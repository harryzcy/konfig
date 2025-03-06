import { parseConfigEntry } from '@/common/parse'
import type { ConfigEntry, ConfigValue, Env } from '@/common/types'
import { errorResponse, successResponse } from '@/response'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log('Handling POST request')

  let entry: ConfigEntry
  try {
    entry = parseConfigEntry(await context.request.text())
  } catch (e) {
    const error = e as Error
    return errorResponse(error)
  }

  const value = {
    type: entry.type,
    value: entry.value
  } as ConfigValue

  console.log(`Storing key entry:${entry.key} in KV`)
  await context.env.CONFIG_KV.put(`entry:${entry.key}`, JSON.stringify(value))
  console.log(`Stored key entry:${entry.key} in KV`)

  return successResponse()
}
