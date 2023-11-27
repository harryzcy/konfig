import {
  ConfigEntry,
  ConfigKey,
  ConfigValue,
  NewEnvironmentRequest
} from './types'
import { z } from 'zod'

const parseJson = (input: string): unknown => {
  let json
  try {
    json = JSON.parse(input)
  } catch (e) {
    throw new Error('invalid input: input is not valid JSON')
  }
  return json
}

export const parseNewEnvironmentRequest = (
  input: string
): NewEnvironmentRequest => {
  const json = parseJson(input)
  try {
    const value = NewEnvironmentRequest.parse(json)
    return value
  } catch (e) {
    const error = e as z.ZodError
    const message = formatZodError(error)
    throw new Error(message)
  }
}

export const parseConfigKey = (input: string): ConfigKey => {
  try {
    const value = ConfigKey.parse(input)
    return value
  } catch (e) {
    throw new Error('invalid input: key cannot contain ":"')
  }
}

export const parseConfigValue = (input: string): ConfigValue => {
  const json = parseJson(input)
  try {
    return ConfigValue.parse(json)
  } catch (e) {
    const error = e as z.ZodError
    const message = formatZodError(error)
    throw new Error(message)
  }
}

export const parseConfigEntry = (input: string): ConfigEntry => {
  const json = parseJson(input)
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
