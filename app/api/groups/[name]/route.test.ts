import { GET, DELETE } from './route'
import { TTL } from '@/src/constants'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe, expect, test, vi } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('GET /api/groups/[name]', () => {
  test('empty environment', async () => {
    await bindings.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: [] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const req = createRequest('GET', '/api/groups/foo', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"foo","metadata":{"created":123},"environments":[]}'
    )
  })

  test('non-empty environment', async () => {
    await bindings.CONFIG_KV.put(
      'group:bar',
      JSON.stringify({ environments: ['repo-1'] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const req = createRequest('GET', '/api/groups/bar', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"bar","metadata":{"created":123},"environments":["repo-1"]}'
    )
  })

  test('404 not found', async () => {
    const req = createRequest('GET', '/api/groups/does-not-exist', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 404)
  })

  test('invalid name', async () => {
    const req = createRequest('GET', '/api/groups/invalid:key', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })

  test('empty name', async () => {
    const req = createRequest('GET', '', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: group name is not defined"}'
    )
  })
})

describe('DELETE /api/groups/[name]', () => {
  test('success', async () => {
    await bindings.CONFIG_KV.put('group:foo', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123,
        deleted: Math.floor(Date.now() / 1000 - TTL - 1)
      }
    })
    const req = createRequest('DELETE', '/api/groups/foo', null)
    const res = await DELETE(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')
    await expect(bindings.CONFIG_KV.get('group:foo')).resolves.toBe(null)
    // Deleting again should give 404
    const resAgain = await DELETE(req)
    expect(resAgain).toHaveProperty('status', 404)
  })

  test('not soft deleted', async () => {
    await bindings.CONFIG_KV.put('group:foo', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123
      }
    })
    const req = createRequest('DELETE', '/api/groups/foo', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo is not soft deleted"}')
  })

  test('soft deleted within TTL', async () => {
    await bindings.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: [] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000)
        }
      }
    )
    const req = createRequest('DELETE', '/api/groups/foo', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Group foo is soft deleted within TTL"}'
    )
  })

  test('has keys', async () => {
    await bindings.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['production'] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000 - TTL - 1)
        }
      }
    )
    await bindings.CONFIG_KV.put('entry:foo:production:bar', 'baz')

    const req = createRequest('DELETE', '/api/groups/foo', null)
    const res = await DELETE(req)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
  })

  test('invalid name', async () => {
    const req = createRequest('DELETE', '/api/groups/invalid:key', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })

  test('empty name', async () => {
    const req = createRequest('DELETE', '', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: group name is not defined"}'
    )
  })
})
