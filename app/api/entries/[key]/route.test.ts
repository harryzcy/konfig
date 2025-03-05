import { GET, DELETE } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe, expect, test, vi } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('GET /api/entries/[key]', () => {
  test('404 not found', async () => {
    const req = createRequest('GET', '/api/entries/does-not-exist', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 404)
  })

  test('success', async () => {
    await bindings.CONFIG_KV.put(
      'entry:foo',
      JSON.stringify({ type: 'text', value: 'test' })
    )

    const req = createRequest('GET', '/api/entries/foo', null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe('{"type":"text","value":"test","key":"foo"}')
  })

  test('invalid key', async () => {
    const req = createRequest('GET', '/api/entries/invalid:key', null)
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
      '{"error":"invalid input: key is not defined"}'
    )
  })
})

describe('DELETE /api/entries/[key]', () => {
  test('success', async () => {
    await bindings.CONFIG_KV.put(
      'entry:foo',
      JSON.stringify({ type: 'text', value: 'test' })
    )

    const req = createRequest('DELETE', '/api/entries/foo', null)
    const res = await DELETE(req)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe('{"message":"success"}')

    await expect(bindings.CONFIG_KV.get('entry:foo')).resolves.toBe(null)

    // Deleting a deleted key has no effect
    const resAgain = await DELETE(req)
    expect(resAgain).toHaveProperty('status', 200)
    expect(await resAgain.text()).toBe('{"message":"success"}')
  })

  test('invalid key', async () => {
    const req = createRequest('DELETE', '/api/entries/invalid:key', null)
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
      '{"error":"invalid input: key is not defined"}'
    )
  })
})
