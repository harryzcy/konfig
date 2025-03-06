import { createContext } from './utils'
import { onRequestGet, onRequestPost } from '@functions/environments'
import { createExecutionContext } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('GET /api/environments', () => {
  const url = '/api/environments'

  test('empty', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', url, null)
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 200)
    expect(await res.json()).toEqual({ environments: [] })
  })

  test('non-empty', async () => {
    {
      const ctx = createExecutionContext()
      const eventCtx = createContext(
        ctx,
        'POST',
        '/api/environments',
        '{"name":"production"}'
      )
      const res = await onRequestPost(eventCtx)
      expect(res).toHaveProperty('status', 200)
    }

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', url, null)
    const res = await onRequestGet(eventCtx)
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
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'POST',
      '/api/environments',
      '{"name":"production"}'
    )
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 200)

    expect(await eventCtx.env.CONFIG_KV.get('env:production')).toBe(
      '{"groups":[]}'
    )
  })

  test('invalid json', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'POST',
      '/api/environments',
      'invalid input'
    )
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
  })

  test('zod validation failed', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', '/api/environments', '{}')
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: field name is invalid"}'
    )
  })
})
