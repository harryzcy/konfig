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

describe('GET /api/environments/[name]', () => {
  test('empty environment', async () => {
    await env.CONFIG_KV.put('env:foo', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123
      }
    })

    const res = await app.request('/api/environments/foo', {}, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"foo","metadata":{"created":123},"groups":[]}'
    )
  })

  test('non-empty environment', async () => {
    await env.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: ['repo-1'] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const res = await app.request('/api/environments/production', {}, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"production","metadata":{"created":123},"groups":["repo-1"]}'
    )
  })

  test('404 not found', async () => {
    const res = await app.request('/api/environments/does-not-exist', {}, env)
    expect(res).toHaveProperty('status', 404)
  })

  test('invalid name', async () => {
    const res = await app.request('/api/environments/invalid:key', {}, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })
})
