import {
  parseConfigEntry,
  parseKey,
  parseConfigValue,
  parseNewEnvironmentRequest,
  parseEnvironmentMetadata,
  parseEnvironmentValue
} from './parse'
import { describe } from 'node:test'
import { expect, test } from 'vitest'

test('key', () => {
  const testCases = [
    {
      input: 'foo',
      output: 'foo'
    },
    {
      input: 'test',
      output: 'test'
    },
    {
      input: 'foo:bar',
      errorMsg: 'invalid input: key cannot contain ":"'
    }
  ]

  for (const testCase of testCases) {
    let hasError = false
    try {
      const value = parseKey(testCase.input)
      expect(value).toEqual(testCase.output)
    } catch (err) {
      const error = err as Error
      expect(error.message).toBe(testCase.errorMsg)
      hasError = true
    }

    expect(hasError).toBe(testCase.errorMsg !== undefined)
  }
})

describe('parseNewEnvironmentRequest', () => {
  test('success', () => {
    const testCases = [
      {
        input: '{"name":"production"}',
        output: { name: 'production' }
      },
      {
        input: '{"name":"foo"}',
        output: { name: 'foo' }
      }
    ]

    for (const testCase of testCases) {
      const value = parseNewEnvironmentRequest(testCase.input)
      expect(value).toEqual(testCase.output)
    }
  })

  test('invalid json', () => {
    expect(() => parseNewEnvironmentRequest('invalid input')).toThrow(
      'invalid input: input is not valid JSON'
    )
  })

  test('zod validation failed', () => {
    expect(() => parseNewEnvironmentRequest('{}')).toThrow(
      'invalid input: field name is invalid'
    )
  })
})

describe('parseEnvironmentMetadata', () => {
  test('success', () => {
    expect(parseEnvironmentMetadata({ created: 123 })).toEqual({
      created: 123
    })
  })

  test('zod validation failed', () => {
    expect(() => parseEnvironmentMetadata({})).toThrow(
      'invalid input: field created is invalid'
    )
  })
})

describe('parseEnvironmentValue', () => {
  test('success', () => {
    const testCases = [
      {
        input: '{"groups":["foo","bar"]}',
        output: { groups: ['foo', 'bar'] }
      },
      {
        input: '{"groups":["foo"]}',
        output: { groups: ['foo'] }
      }
    ]

    for (const testCase of testCases) {
      const value = parseEnvironmentValue(testCase.input)
      expect(value).toEqual(testCase.output)
    }
  })

  test('invalid json', () => {
    expect(() => parseEnvironmentValue('invalid input')).toThrow(
      'invalid input: input is not valid JSON'
    )
  })

  test('zod validation failed', () => {
    expect(() => parseEnvironmentValue('{}')).toThrow(
      'invalid input: field groups is invalid'
    )
  })
})

test('config value', () => {
  const testCases = [
    {
      input: '{"type":"text","value":"bar"}',
      output: { type: 'text', value: 'bar' }
    },
    {
      input: '{"type":"json","value":"bar"}',
      output: { type: 'json', value: 'bar' }
    },
    {
      input: '{"type":"yaml","value":"bar"}',
      output: { type: 'yaml', value: 'bar' }
    },
    {
      input: '{"type":"yaml"}',
      errorMsg: 'invalid input: field value is invalid'
    },
    {
      input: '{"type":"error","value":"bar"}',
      errorMsg: 'invalid input: field type is invalid'
    }
  ]

  for (const testCase of testCases) {
    let hasError = false
    try {
      const value = parseConfigValue(testCase.input)
      expect(value).toEqual(testCase.output)
    } catch (err) {
      const error = err as Error
      expect(error.message).toBe(testCase.errorMsg)
      hasError = true
    }

    expect(hasError).toBe(testCase.errorMsg !== undefined)
  }
})

test('config schema', () => {
  const testCases = [
    {
      input: '{"type":"text","key":"foo","value":"bar"}',
      output: { type: 'text', key: 'foo', value: 'bar' }
    },
    {
      input: '{"type":"json"}',
      errorMsg: 'invalid input: fields key, value are invalid'
    },
    {
      input: '{"type":"json","value":"bar"}',
      errorMsg: 'invalid input: field key is invalid'
    },
    {
      input: '{"key":"foo"}',
      errorMsg: 'invalid input: fields type, value are invalid'
    },
    {
      input: '{"type":"error","key":"foo","value":"bar"}',
      errorMsg: 'invalid input: field type is invalid'
    }
  ]

  for (const testCase of testCases) {
    let hasError = false
    try {
      const value = parseConfigEntry(testCase.input)
      expect(value).toEqual(testCase.output)
    } catch (err) {
      const error = err as Error
      expect(error.message).toBe(testCase.errorMsg)
      hasError = true
    }

    expect(hasError).toBe(testCase.errorMsg !== undefined)
  }
})
