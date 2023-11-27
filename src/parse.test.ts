import { parseConfigEntry, parseKey, parseConfigValue } from './parse'
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
