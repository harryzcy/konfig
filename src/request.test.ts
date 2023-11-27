import { getLastPathname } from './request'
import { describe, expect, test } from 'vitest'

describe('getLastPathname', () => {
  test('success', () => {
    expect(
      getLastPathname('https://example.com/foo/bar', 'environment name')
    ).toBe('bar')
  })

  test('empty', () => {
    expect(() =>
      getLastPathname('https://example.com', 'environment name')
    ).toThrowError('invalid input: environment name is not defined')
  })
})
