import { POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe, expect, test, vi } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('POST /api/groups/[name]/link', () => {
  const url = '/api/groups/foo/link'

  const defaultMetadata = {
    created: 123
  }

  test('success', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: [] }),
      {
        metadata: defaultMetadata
      }
    )
    await bindings.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: [] }),
      {
        metadata: defaultMetadata
      }
    )

    const body = JSON.stringify({ environments: ['production'] })
    const req = createRequest('POST', url, body)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    const { value: group, metadata: groupMetadata } =
      await bindings.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":["production"]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    const { value: env, metadata: envMetadata } =
      await bindings.CONFIG_KV.getWithMetadata('env:production')
    expect(env).toBe('{"groups":["foo"]}')
    expect(envMetadata).toStrictEqual(defaultMetadata)

    // linking again should be a no-op
    const resAgain = await POST(createRequest('POST', url, body))
    expect(resAgain.status).toBe(200)
    const { value: groupAgain, metadata: groupMetadataAgain } =
      await bindings.CONFIG_KV.getWithMetadata('group:foo')
    expect(groupAgain).toBe('{"environments":["production"]}')
    expect(groupMetadataAgain).toStrictEqual(defaultMetadata)

    const { value: envAgain, metadata: envMetadataAgain } =
      await bindings.CONFIG_KV.getWithMetadata('env:production')
    expect(envAgain).toBe('{"groups":["foo"]}')
    expect(envMetadataAgain).toStrictEqual(defaultMetadata)
  })

  test('success with multiple environments', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: [] }),
      {
        metadata: defaultMetadata
      }
    )
    await bindings.CONFIG_KV.put(
      'env:staging',
      JSON.stringify({ groups: [] }),
      {
        metadata: defaultMetadata
      }
    )
    await bindings.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: [] }),
      {
        metadata: defaultMetadata
      }
    )

    const body = JSON.stringify({ environments: ['production', 'staging'] })
    const req = createRequest('POST', url, body)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    const { value: group, metadata: groupMetadata } =
      await bindings.CONFIG_KV.getWithMetadata('group:foo')
    expect(group).toBe('{"environments":["production","staging"]}')
    expect(groupMetadata).toStrictEqual(defaultMetadata)

    const { value: env, metadata: envMetadata } =
      await bindings.CONFIG_KV.getWithMetadata('env:production')
    expect(env).toBe('{"groups":["foo"]}')
    expect(envMetadata).toStrictEqual(defaultMetadata)

    const { value: env2, metadata: envMetadata2 } =
      await bindings.CONFIG_KV.getWithMetadata('env:staging')
    expect(env2).toBe('{"groups":["foo"]}')
    expect(envMetadata2).toStrictEqual(defaultMetadata)
  })

  test('404 not found', async () => {
    const body = JSON.stringify({ environments: ['production'] })
    const req = createRequest('POST', '/api/groups/not-found/link', body)
    const res = await POST(req)
    expect(res).toHaveProperty('status', 404)
    expect(await res.text()).toBe('{"error":"not found"}')
  })

  test('empty name', async () => {
    const req = createRequest('POST', '', null)
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: group name is not defined"}'
    )
  })
})
