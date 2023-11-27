import { POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe, expect, test, vi } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('POST /api/groups/[name]/delete', () => {
  const url = '/api/groups/foo/delete'

  test('success', async () => {
    await bindings.CONFIG_KV.put(
      'env:foo',
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

    await expect(bindings.CONFIG_KV.get('env:foo')).resolves.toBeDefined()

    // Deleting again should give 400, already soft deleted
    const resAgain = await POST(req)
    expect(resAgain).toHaveProperty('status', 400)
    expect(await resAgain.text()).toBe(
      '{"error":"Group foo is already soft deleted"}'
    )
  })

  test('has keys', async () => {
    await bindings.CONFIG_KV.put(
      'env:foo',
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
  })

  test('has multiple keys', async () => {
    await bindings.CONFIG_KV.put(
      'env:foo',
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
  })

  test('404 not found', async () => {
    const req = createRequest('GET', '/api/groups/not-found/delete', null)
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
