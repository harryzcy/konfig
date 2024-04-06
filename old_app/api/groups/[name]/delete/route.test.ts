import { POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe, expect, test, vi } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('POST /api/groups/[name]/delete', () => {
  const url = '/api/groups/foo/delete'

  test('success', async () => {
    await bindings.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: [] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const req = createRequest('POST', url, null)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('{"message":"success"}')
    expect(await bindings.CONFIG_KV.get('group:foo')).toBe(
      '{"environments":[]}'
    )
    expect(
      await bindings.CONFIG_KV.getWithMetadata('group:foo')
    ).toHaveProperty('metadata.deleted')

    // Deleting again should give 400, already soft deleted
    const resAgain = await POST(req)
    expect(resAgain).toHaveProperty('status', 400)
    expect(await resAgain.text()).toBe(
      '{"error":"Group foo is already soft deleted"}'
    )
  })

  test('has keys', async () => {
    await bindings.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['staging'] }),
      {
        metadata: {
          created: 123
        }
      }
    )
    await bindings.CONFIG_KV.put('entry:foo:staging:bar', 'baz')

    const req = createRequest('POST', url, null)
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
    expect(await bindings.CONFIG_KV.get('group:foo')).toBe(
      '{"environments":["staging"]}'
    )
    expect(await bindings.CONFIG_KV.get('entry:foo:staging:bar')).toBe('baz')
  })

  test('has multiple keys', async () => {
    await bindings.CONFIG_KV.put(
      'group:foo',
      JSON.stringify({ environments: ['production', 'staging', 'demo'] }),
      {
        metadata: {
          created: 123
        }
      }
    )
    await bindings.CONFIG_KV.put('entry:foo:staging:bar', 'baz')
    await bindings.CONFIG_KV.put('entry:foo:production:bar', 'baz')

    const req = createRequest('POST', url, null)
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe('{"error":"Group foo still has keys"}')
    expect(await bindings.CONFIG_KV.get('group:foo')).toBe(
      '{"environments":["production","staging","demo"]}'
    )
  })

  test('404 not found', async () => {
    const req = createRequest('POSt', '/api/groups/not-found/delete', null)
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
