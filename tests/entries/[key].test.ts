import { onRequestDelete, onRequestGet } from '@functions/api/entries/[key]'
import { createContext } from '@tests/utils'
import { env } from 'cloudflare:test'
import { createExecutionContext } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('GET /api/entries/[key]', () => {
  test('404 not found', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'GET',
      '/api/entries/does-not-exist',
      null
    )
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 404)
  })

  test('success', async () => {
    await env.CONFIG_KV.put(
      'entry:foo',
      JSON.stringify({ type: 'text', value: 'test' })
    )

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', '/api/entries/foo', null)
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe('{"type":"text","value":"test","key":"foo"}')
  })

  test('invalid key', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', '/api/entries/invalid:key', null)
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })

  test('empty key', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', '', null)
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key is not defined"}'
    )
  })
})

describe('DELETE /api/entries/[key]', () => {
  test('success', async () => {
    await env.CONFIG_KV.put(
      'entry:foo',
      JSON.stringify({ type: 'text', value: 'test' })
    )

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'DELETE', '/api/entries/foo', null)
    const res = await onRequestDelete(eventCtx)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe('{"message":"success"}')

    await expect(env.CONFIG_KV.get('entry:foo')).resolves.toBe(null)

    // Deleting a deleted key has no effect
    const resAgain = await onRequestDelete(eventCtx)
    expect(resAgain).toHaveProperty('status', 200)
    expect(await resAgain.text()).toBe('{"message":"success"}')
  })

  test('invalid key', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'DELETE',
      '/api/entries/invalid:key',
      null
    )
    const res = await onRequestDelete(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })

  test('empty key', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'DELETE', '', null)
    const res = await onRequestDelete(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key is not defined"}'
    )
  })
})
