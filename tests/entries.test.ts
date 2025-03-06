import { createContext } from './utils'
import { onRequestPost } from '@functions/api/entries'
import { createExecutionContext } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('POST /api/entries', () => {
  const url = '/api/entries'

  test('success', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'POST',
      url,
      '{"type":"text", "key": "foo", "value":"test"}'
    )
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 200)

    expect(await eventCtx.env.CONFIG_KV.get('entry:foo')).toBe(
      '{"type":"text","value":"test"}'
    )
  })

  test('invalid json', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, 'invalid input')
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
  })

  test('zod validation failed', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, '{"type":"text"}')
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: fields key, value are invalid"}'
    )
  })
})
