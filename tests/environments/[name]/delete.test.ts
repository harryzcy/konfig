import { onRequestPost } from '@functions/api/environments/[name]/delete'
import { createContext, createRequest } from '@tests/utils'
import { createExecutionContext } from 'cloudflare:test'
import { env } from 'cloudflare:test'
import { describe, expect, test, vi } from 'vitest'

describe('POST /api/environments/[name]/delete', () => {
  const url = '/api/environments/production/delete'

  test('success', async () => {
    await env.CONFIG_KV.put('env:production', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123
      }
    })

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, null)
    const res = await onRequestPost(eventCtx)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    await expect(env.CONFIG_KV.get('env:production')).resolves.toBeDefined()

    // Deleting again should give 400, already soft deleted
    const resAgain = await onRequestPost(eventCtx)
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

    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, null)
    const res = await onRequestPost(eventCtx)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production has groups"}'
    )
  })

  test('404 not found', async () => {
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'POST',
      '/api/environments/not-found/delete',
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
      '{"error":"invalid input: environment name is not defined"}'
    )
  })
})
