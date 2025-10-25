import { TTL } from '@/common/constants'
import {
  onRequestGet,
  onRequestDelete
} from '@functions/api/environments/[name]'
import { createContext } from '@tests/utils'
import { createExecutionContext } from 'cloudflare:test'
import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('GET /api/environments/[name]', () => {
  test('empty environment', async () => {
    await env.CONFIG_KV.put('env:foo', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123
      }
    })

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', '/api/environments/foo', null)
    const res = await onRequestGet(eventCtx)
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

    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'GET',
      '/api/environments/production',
      null
    )
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"production","metadata":{"created":123},"groups":["repo-1"]}'
    )
  })

  test('404 not found', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'GET',
      '/api/environments/does-not-exist',
      null
    )
    const res = await onRequestGet(eventCtx)
    expect(res).toHaveProperty('status', 404)
  })

  test('invalid name', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'GET',
      '/api/environments/invalid:key',
      null
    )
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
      '{"error":"invalid input: environment name is not defined"}'
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

    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'DELETE',
      '/api/environments/production',
      null
    )
    const res = await onRequestDelete(eventCtx)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    await expect(env.CONFIG_KV.get('env:production')).resolves.toBe(null)

    // Deleting again should give 404
    const resAgain = await onRequestDelete(eventCtx)
    expect(resAgain).toHaveProperty('status', 404)
  })

  test('not soft deleted', async () => {
    await env.CONFIG_KV.put('env:production', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123
      }
    })

    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'DELETE',
      '/api/environments/production',
      null
    )
    const res = await onRequestDelete(eventCtx)
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

    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'DELETE',
      '/api/environments/production',
      null
    )
    const res = await onRequestDelete(eventCtx)
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

    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'DELETE',
      '/api/environments/production',
      null
    )
    const res = await onRequestDelete(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production has groups"}'
    )
  })

  test('invalid name', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'DELETE',
      '/api/environments/invalid:key',
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
      '{"error":"invalid input: environment name is not defined"}'
    )
  })
})
