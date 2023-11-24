import { ConfigEntry } from './types'
import { z } from 'zod'

export const parseConfigEntry = (input: string): ConfigEntry => {
  try {
    const value = ConfigEntry.parse(input)
    return value
  } catch (e) {
    const error = e as z.ZodError

    const fields = []
    for (const issue of error.issues) {
      fields.push(issue.path.join('.'))
    }

    const message =
      `invalid input: field${fields.length > 1 ? 's' : ''} ` +
      fields.join(', ') +
      ` ${fields.length > 1 ? 'are' : 'is'} invalid`
    throw new Error(message)
  }
}
