import { onRequestPost } from '@functions/api/groups/[name]/delete'
import { createContext } from '@tests/utils'
import { createExecutionContext } from 'cloudflare:test'
import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('POST /api/groups/[name]/delete', () => {
  const url = '/api/groups/foo/delete'

  test('success', async () => {
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: {
        created: 123
      }
    })

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, null)
    const res = await onRequestPost(eventCtx)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')
    expect(await env.CONFIG_KV.get('group:foo')).toBe('{"environments":[]}')
    expect(await env.CONFIG_KV.getWithMetadata('group:foo')).toHaveProperty(
      'metadata.deleted'
    )

    // Deleting again should give 400, already soft deleted
    const resAgain = await onRequestPost(eventCtx)
    expect(resAgain).toHaveProperty('status', 400)
    expect(await resAgain.text()).toBe(
      '{"error":"Group foo is already soft deleted"}'
    )
  })

  test('has keys', async () => {
    await env.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['staging'] }),
      {
        metadata: {
          created: 123
        }
      }
    )
    await env.CONFIG_KV.put('entry:foo:staging:bar', 'baz')

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, null)
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
    expect(await env.CONFIG_KV.get('group:foo')).toBe(
      '{"environments":["staging"]}'
    )
    expect(await env.CONFIG_KV.get('entry:foo:staging:bar')).toBe('baz')
  })

  test('has multiple keys', async () => {
    await env.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['production', 'staging', 'demo'] }),
      {
        metadata: {
          created: 123
        }
      }
    )
    await env.CONFIG_KV.put('entry:foo:staging:bar', 'baz')
    await env.CONFIG_KV.put('entry:foo:production:bar', 'baz')

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, null)
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
    expect(await env.CONFIG_KV.get('group:foo')).toBe(
      '{"environments":["production","staging","demo"]}'
    )
  })

  test('404 not found', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'POSt',
      '/api/groups/not-found/delete',
      null
    )
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 404)
    expect(await res.text()).toBe('{"error":"not found"}')
  })

  test('empty name', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', '', null)
    const res = await onRequestPost(eventCtx)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: group name is not defined"}'
    )
  })
})
