import { TTL } from '@/common/constants'
import { onRequestDelete, onRequestGet } from '@functions/api/groups/[name]'
import { createContext } from '@tests/utils'
import { env } from 'cloudflare:test'
import { createExecutionContext } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('GET /api/groups/[name]', () => {
  test('empty environment', async () => {
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: {
        created: 123
      }
    })

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', '/api/groups/foo', null)
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"foo","metadata":{"created":123},"environments":[]}'
    )
    await env.CONFIG_KV.delete('group:foo')
  })

  test('non-empty environment', async () => {
    await env.CONFIG_KV.put(
      'group:bar',
      JSON.stringify({ environments: ['repo-1'] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', '/api/groups/bar', null)
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"bar","metadata":{"created":123},"environments":["repo-1"]}'
    )
    await env.CONFIG_KV.delete('group:bar')
  })

  test('404 not found', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'GET',
      '/api/groups/does-not-exist',
      null
    )
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 404)
  })

  test('invalid name', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', '/api/groups/invalid:key', null)
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })

  test('empty name', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', '', null)
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: group name is not defined"}'
    )
  })
})

describe('DELETE /api/groups/[name]', () => {
  test('success', async () => {
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: {
        created: 123,
        deleted: Math.floor(Date.now() / 1000 - TTL - 1)
      }
    })
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'DELETE', '/api/groups/foo', null)
    const res = await onRequestDelete(eventCtx)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')
    await expect(env.CONFIG_KV.get('group:foo')).resolves.toBe(null)

    // Deleting again should give 404
    const resAgain = await onRequestDelete(eventCtx)
    expect(resAgain).toHaveProperty('status', 404)
  })

  test('not soft deleted', async () => {
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: {
        created: 123
      }
    })
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'DELETE', '/api/groups/foo', null)
    const res = await onRequestDelete(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo is not soft deleted"}')
    await expect(env.CONFIG_KV.get('group:foo')).resolves.toBe(
      '{"environments":[]}'
    )
    await env.CONFIG_KV.delete('group:foo')
  })

  test('soft deleted within TTL', async () => {
    await env.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['production'] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000)
        }
      }
    )
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'DELETE', '/api/groups/foo', null)
    const res = await onRequestDelete(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Group foo is soft deleted within TTL"}'
    )
    await expect(env.CONFIG_KV.get('group:foo')).resolves.toBe(
      '{"environments":["production"]}'
    )
    await env.CONFIG_KV.delete('group:foo')
  })

  test('has keys', async () => {
    await env.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['production'] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000 - TTL - 1)
        }
      }
    )
    await env.CONFIG_KV.put('entry:foo:production:bar', 'baz')

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'DELETE', '/api/groups/foo', null)
    const res = await onRequestDelete(eventCtx)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
    await expect(env.CONFIG_KV.get('group:foo')).resolves.toBe(
      '{"environments":["production"]}'
    )
    await env.CONFIG_KV.delete('group:foo')
  })

  test('invalid name', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'DELETE',
      '/api/groups/invalid:key',
      null
    )
    const res = await onRequestDelete(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })

  test('empty name', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'DELETE', '', null)
    const res = await onRequestDelete(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: group name is not defined"}'
    )
  })
})
