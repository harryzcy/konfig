import app from '../src/index'
import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('GET /api/groups', () => {
  const url = '/api/groups'

  test('empty', async () => {
    const res = await app.request(url, {}, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.json()).toEqual({ groups: [] })
  })

  test('non-empty', async () => {
    {
      const res = await app.request(
        url,
        { method: 'POST', body: '{"name":"project-1"}' },
        env
      )
      expect(res).toHaveProperty('status', 200)
    }
    const res = await app.request(url, {}, env)
    expect(res).toHaveProperty('status', 200)
    const result = await res.json()
    expect(result).toHaveProperty('groups')
    expect(result['groups']).toHaveLength(1)
    expect(result['groups']).toBeInstanceOf(Array)
    expect(result['groups']).toContain('project-1')
  })
})

describe('POST /api/groups', () => {
  const url = '/api/groups'
  test('success', async () => {
    // const eventCtx = createContext(ctx, 'POST', url, '{"name":"project-1"}')
    const res = await app.request(
      url,
      {
        method: 'POST',
        body: '{"name":"project-1"}'
      },
      env
    )
    expect(res).toHaveProperty('status', 200)
    expect(await env.CONFIG_KV.get('group:project-1')).toBe(
      '{"environments":[]}'
    )
    await env.CONFIG_KV.delete('group:project-1')
  })

  test('invalid json', async () => {
    const res = await app.request(
      url,
      {
        method: 'POST',
        body: 'invalid input'
      },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
    expect(
      await env.CONFIG_KV.list({
        prefix: 'group:'
      })
    ).toHaveProperty('keys', [])
  })

  test('zod validation failed', async () => {
    const res = await app.request(
      url,
      {
        method: 'POST',
        body: '{}'
      },
      env
    )
    expect(res).toHaveProperty('status', 400)
    const text = await res.text()
    console.log('text', text)
    expect(text).toBe('{"error":"invalid input: field name is invalid"}')
    expect(
      await env.CONFIG_KV.list({
        prefix: 'group:'
      })
    ).toHaveProperty('keys', [])
  })
})
