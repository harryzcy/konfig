import { onRequestPost } from '@functions/api/groups/[name]/link'
import { createContext, createRequest } from '@tests/utils'
import { createExecutionContext } from 'cloudflare:test'
import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('POST /api/groups/[name]/link', () => {
  const url = '/api/groups/foo/link'

  const defaultMetadata = {
    created: 123
  }

  test('success', async () => {
    await env.CONFIG_KV.put('env:production', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('group:foo', '{"environments":[]}', {
      metadata: defaultMetadata
    })

    const body = JSON.stringify({ environments: ['production'] })
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, body)
    const res = await onRequestPost(eventCtx)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":["production"]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    const { value: environment, metadata: envMetadata } =
      await env.CONFIG_KV.getWithMetadata('env:production')
    expect(environment).toBe('{"groups":["foo"]}')
    expect(envMetadata).toStrictEqual(defaultMetadata)

    // linking again should be a no-op
    const resAgain = await onRequestPost(createContext(ctx, 'POST', url, body))
    expect(resAgain.status).toBe(200)
    const { value: groupAgain, metadata: groupMetadataAgain } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(groupAgain).toBe('{"environments":["production"]}')
    expect(groupMetadataAgain).toStrictEqual(defaultMetadata)

    const { value: envAgain, metadata: envMetadataAgain } =
      await env.CONFIG_KV.getWithMetadata('env:production')
    expect(envAgain).toBe('{"groups":["foo"]}')
    expect(envMetadataAgain).toStrictEqual(defaultMetadata)

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('success with multiple environments', async () => {
    await env.CONFIG_KV.put('env:production', JSON.stringify({ groups: [] }), {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('env:staging', JSON.stringify({ groups: [] }), {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('group:foo', JSON.stringify({ environments: [] }), {
      metadata: defaultMetadata
    })

    const body = JSON.stringify({ environments: ['production', 'staging'] })
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, body)
    const res = await onRequestPost(eventCtx)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":["production","staging"]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    const { value: environment, metadata: envMetadata } =
      await env.CONFIG_KV.getWithMetadata('env:production')
    expect(environment).toBe('{"groups":["foo"]}')
    expect(envMetadata).toStrictEqual(defaultMetadata)

    const { value: env2, metadata: envMetadata2 } =
      await env.CONFIG_KV.getWithMetadata('env:staging')
    expect(env2).toBe('{"groups":["foo"]}')
    expect(envMetadata2).toStrictEqual(defaultMetadata)

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('env:staging')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('one of the environment is marked as deleted', async () => {
    await env.CONFIG_KV.put('env:production', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('env:demo', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('env:staging', '{"groups":[]}', {
      metadata: {
        ...defaultMetadata,
        deleted: Math.floor(Date.now() / 1000)
      }
    })
    await env.CONFIG_KV.put('group:foo', '{"environments":["demo"]}', {
      metadata: defaultMetadata
    })

    const body = JSON.stringify({ environments: ['production', 'staging'] })
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, body)
    const res = await onRequestPost(eventCtx)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('{"error":"Environment staging is deleted"}')

    // values not changed
    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":["demo"]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    expect(await env.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')
    expect(await env.CONFIG_KV.get('env:staging')).toBe('{"groups":[]}')

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('env:demo')
    await env.CONFIG_KV.delete('env:staging')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('one of the environment does not exist', async () => {
    await env.CONFIG_KV.put('env:production', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('group:foo', '{"environments":[]}', {
      metadata: defaultMetadata
    })

    const body = JSON.stringify({ environments: ['production', 'staging'] })
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, body)
    const res = await onRequestPost(eventCtx)
    expect(res.status).toBe(404)
    expect(await res.text()).toBe(
      '{"error":"Environment staging is not found"}'
    )

    // values not changed
    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":[]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    expect(await env.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('group key is already soft deleted', async () => {
    const deletedTime = Math.floor(Date.now() / 1000)
    await env.CONFIG_KV.put('env:production', '{"groups":[]}', {
      metadata: defaultMetadata
    })
    await env.CONFIG_KV.put('group:foo', '{"environments":[]}', {
      metadata: {
        ...defaultMetadata,
        deleted: deletedTime
      }
    })

    const body = JSON.stringify({ environments: ['production'] })
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'POST', url, body)
    const res = await onRequestPost(eventCtx)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('{"error":"Group foo is soft deleted"}')

    // values not changed
    const { value: group, metadata: groupMetadata } =
      await env.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":[]}')
    expect(groupMetadata).toStrictEqual({
      ...defaultMetadata,
      deleted: deletedTime
    })

    expect(await env.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')

    // cleanup
    await env.CONFIG_KV.delete('env:production')
    await env.CONFIG_KV.delete('group:foo')
  })

  test('404 not found', async () => {
    const body = JSON.stringify({ environments: ['production'] })
    const ctx = createExecutionContext()
    const eventCtx = createContext(
      ctx,
      'POST',
      '/api/groups/not-found/link',
      body
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
