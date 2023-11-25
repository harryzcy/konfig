import { ConfigEntry, ConfigKey, ConfigValue } from './types'
import { z } from 'zod'

export const parseConfigKey = (input: string): ConfigKey => {
  try {
    const value = ConfigKey.parse(input)
    return value
  } catch (e) {
    throw new Error('invalid input: key cannot contain ":"')
  }
}

export const parseConfigValue = (input: string): ConfigValue => {
  try {
    return ConfigValue.parse(JSON.parse(input))
  } catch (e) {
    const error = e as z.ZodError
    const message = formatZodError(error)
    throw new Error(message)
  }
}

export const parseConfigEntry = (input: string): ConfigEntry => {
  let json
  try {
    json = JSON.parse(input)
  } catch (e) {
    throw new Error('invalid input: input is not valid JSON')
  }

  try {
    const value = ConfigEntry.parse(json)
    return value
  } catch (e) {
    const error = e as z.ZodError
    const message = formatZodError(error)
    throw new Error(message)
  }
}

const formatZodError = (error: z.ZodError): string => {
  const fields = []
  for (const issue of error.issues) {
    fields.push(issue.path.join('.'))
  }

  const message =
    `invalid input: field${fields.length > 1 ? 's' : ''} ` +
    fields.join(', ') +
    ` ${fields.length > 1 ? 'are' : 'is'} invalid`
  return message
}
