import { GET, POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe } from 'node:test'
import { expect, test } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('GET /api/environments', () => {
  const url = '/api/environments'

  test('empty', async () => {
    const req = createRequest('GET', url, null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    expect(await res.json()).toEqual({ environments: [] })
  })

  test('non-empty', async () => {
    {
      const req = createRequest(
        'POST',
        '/api/environments',
        '{"name":"production"}'
      )
      const res = await POST(req)
      expect(res).toHaveProperty('status', 200)
    }

    const req = createRequest('GET', url, null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    const result = await res.json()
    expect(result).toHaveProperty('environments')
    expect(result['environments']).toHaveLength(1)
    expect(result['environments']).toBeInstanceOf(Array)
    expect(result['environments']).toContain('production')
  })
})

describe('POST /api/environments', () => {
  test('success', async () => {
    const req = createRequest(
      'POST',
      '/api/environments',
      '{"name":"production"}'
    )
    const res = await POST(req)
    expect(res).toHaveProperty('status', 200)

    expect(await bindings.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')
  })

  test('invalid json', async () => {
    const req = createRequest('POST', '/api/environments', 'invalid input')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
  })

  test('zod validation failed', async () => {
    const req = createRequest('POST', '/api/environments', '{}')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: field name is invalid"}'
    )
  })
})
