import { GET, DELETE } from './route'
import { TTL } from '@/src/constants'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe, expect, test, vi } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('GET /api/environments/[name]', () => {
  test('empty environment', async () => {
    await bindings.CONFIG_KV.put('env:foo', JSON.stringify({ groups: [] }), {
      metadata: {
        created: 123
      }
    })

    const req = createRequest('GET', '/api/environments/foo', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"foo","metadata":{"created":123},"groups":[]}'
    )
  })

  test('non-empty environment', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: ['repo-1'] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const req = createRequest('GET', '/api/environments/production', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe(
      '{"name":"production","metadata":{"created":123},"groups":["repo-1"]}'
    )
  })

  test('404 not found', async () => {
    const req = createRequest('GET', '/api/environments/does-not-exist', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 404)
  })

  test('invalid key', async () => {
    const req = createRequest('GET', '/api/environments/invalid:key', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })

  test('empty key', async () => {
    const req = createRequest('GET', '', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: environment name is not defined"}'
    )
  })
})

describe('DELETE /api/environments/[name]', () => {
  test('success', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: [] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000 - TTL - 1)
        }
      }
    )

    const req = createRequest('DELETE', '/api/environments/production', null)
    const res = await DELETE(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')

    await expect(bindings.CONFIG_KV.get('env:production')).resolves.toBe(null)

    // Deleting again should give 404
    const resAgain = await DELETE(req)
    expect(resAgain).toHaveProperty('status', 404)
  })

  test('not soft deleted', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: [] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const req = createRequest('DELETE', '/api/environments/production', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production is not soft deleted"}'
    )
  })

  test('soft deleted within TTL', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: [] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000)
        }
      }
    )

    const req = createRequest('DELETE', '/api/environments/production', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production is soft deleted within TTL"}'
    )
  })

  test('has groups', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: ['project-1'] }),
      {
        metadata: {
          created: 123,
          deleted: Math.floor(Date.now() / 1000 - TTL - 1)
        }
      }
    )

    const req = createRequest('DELETE', '/api/environments/production', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production has groups"}'
    )
  })

  test('invalid key', async () => {
    const req = createRequest('DELETE', '/api/environments/invalid:key', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })

  test('empty key', async () => {
    const req = createRequest('DELETE', '', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: environment name is not defined"}'
    )
  })
})
