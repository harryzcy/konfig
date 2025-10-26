import app from '../src'
import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('GET /api/environments', () => {
  const url = '/api/environments'

  test('empty', async () => {
    const res = await app.request(url, {}, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.json()).toEqual({ environments: [] })
  })

  test('non-empty', async () => {
    {
      const res = await app.request(
        url,
        {
          method: 'POST',
          body: '{"name":"production"}'
        },
        env
      )
      expect(res).toHaveProperty('status', 200)
    }

    const res = await app.request(url, {}, env)
    expect(res).toHaveProperty('status', 200)
    const result = await res.json()
    expect(result).toHaveProperty('environments')
    expect(result['environments']).toHaveLength(1)
    expect(result['environments']).toBeInstanceOf(Array)
    expect(result['environments']).toContain('production')
  })
})

describe('POST /api/environments', () => {
  const url = '/api/environments'

  test('success', async () => {
    const res = await app.request(
      url,
      { method: 'POST', body: '{"name":"production"}' },
      env
    )
    expect(res).toHaveProperty('status', 200)

    expect(await env.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')
  })

  test('invalid json', async () => {
    const res = await app.request(
      url,
      { method: 'POST', body: 'invalid input' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
  })

  test('zod validation failed', async () => {
    const res = await app.request(url, { method: 'POST', body: '{}' }, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: field name is invalid"}'
    )
  })
})
