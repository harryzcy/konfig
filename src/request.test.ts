import { getLastPathname, getNthLastPathname } from './request'
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

describe('getNthLastPathname', () => {
  test('success', () => {
    expect(
      getNthLastPathname(
        'https://example.com/foo/delete',
        1,
        'environment name'
      )
    ).toBe('foo')
  })

  test('fail', () => {
    expect(() =>
      getNthLastPathname('https://example.com/foo/bar', 3, 'environment name')
    ).toThrowError('invalid input: environment name is not defined')
  })
})
