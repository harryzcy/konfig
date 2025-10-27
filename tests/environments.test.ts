import app from '../src'
import { TTL } from '../src/common/constants'
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

describe('DELETE /api/environments/[name]', () => {
  test('success', async () => {
    await env.CONFIG_KV.put('env:production', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123,
        deleted: Math.floor(Date.now() / 1000 - TTL - 1)
      }
    })

    const res = await app.request(
      '/api/environments/production',
      { method: 'DELETE' },
      env
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    await expect(env.CONFIG_KV.get('env:production')).resolves.toBe(null)

    // Deleting again should give 404
    const resAgain = await app.request(
      '/api/environments/production',
      { method: 'DELETE' },
      env
    )
    expect(resAgain).toHaveProperty('status', 404)
  })

  test('not soft deleted', async () => {
    await env.CONFIG_KV.put('env:production', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123
      }
    })

    const res = await app.request(
      '/api/environments/production',
      { method: 'DELETE' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production is not soft deleted"}'
    )
  })

  test('soft deleted within TTL', async () => {
    await env.CONFIG_KV.put('env:production', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123,
        deleted: Math.floor(Date.now() / 1000)
      }
    })

    const res = await app.request(
      '/api/environments/production',
      { method: 'DELETE' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production is soft deleted within TTL"}'
    )
  })

  test('has groups', async () => {
    await env.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: ['project-1'] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000 - TTL - 1)
        }
      }
    )

    const res = await app.request(
      '/api/environments/production',
      { method: 'DELETE' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production has groups"}'
    )
  })

  test('invalid name', async () => {
    const res = await app.request(
      '/api/environments/invalid:key',
      { method: 'DELETE' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })
})

describe('POST /api/environments/[name]/delete', () => {
  const url = '/api/environments/production/delete'

  test('success', async () => {
    await env.CONFIG_KV.put('env:production', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123
      }
    })

    const res = await app.request(url, { method: 'POST' }, env)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    await expect(env.CONFIG_KV.get('env:production')).resolves.toBeDefined()

    // Deleting again should give 400, already soft deleted
    const resAgain = await app.request(url, { method: 'POST' }, env)
    expect(resAgain).toHaveProperty('status', 400)
    expect(await resAgain.text()).toBe(
      '{"error":"Environment production is already soft deleted"}'
    )
  })

  test('has groups', async () => {
    await env.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: ['project-1'] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const res = await app.request(url, { method: 'POST' }, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production has groups"}'
    )
  })

  test('404 not found', async () => {
    const res = await app.request(
      '/api/environments/not-found/delete',
      { method: 'POST' },
      env
    )
    expect(res).toHaveProperty('status', 404)
    expect(await res.text()).toBe('{"error":"not found"}')
  })
})
