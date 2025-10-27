import app from '../src'
import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('POST /api/entries', () => {
  const url = '/api/entries'

  test('success', async () => {
    const res = await app.request(
      url,
      { method: 'POST', body: '{"type":"text", "key": "foo", "value":"test"}' },
      env
    )
    expect(res).toHaveProperty('status', 200)

    expect(await env.CONFIG_KV.get('entry:foo')).toBe(
      '{"type":"text","value":"test"}'
    )
  })

  test('invalid json', async () => {
    const res = await app.request(
      url,
      { method: 'POST', body: 'invalid input' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
  })

  test('zod validation failed', async () => {
    const res = await app.request(
      url,
      { method: 'POST', body: '{"type":"text"}' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: fields key, value are invalid"}'
    )
  })
})

describe('GET /api/entries/[key]', () => {
  test('404 not found', async () => {
    const res = await app.request('/api/entries/does-not-exist', {}, env)
    expect(res).toHaveProperty('status', 404)
  })

  test('success', async () => {
    await env.CONFIG_KV.put(
      'entry:foo',
      JSON.stringify({ type: 'text', value: 'test' })
    )

    const res = await app.request('/api/entries/foo', {}, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe('{"type":"text","value":"test","key":"foo"}')
  })

  test('invalid key', async () => {
    const res = await app.request('/api/entries/invalid:key', {}, env)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })
})

describe('DELETE /api/entries/[key]', () => {
  test('success', async () => {
    await env.CONFIG_KV.put(
      'entry:foo',
      JSON.stringify({ type: 'text', value: 'test' })
    )

    const res = await app.request('/api/entries/foo', { method: 'DELETE' }, env)
    expect(res).toHaveProperty('status', 200)
    expect(await res.text()).toBe('{"message":"success"}')

    await expect(env.CONFIG_KV.get('entry:foo')).resolves.toBe(null)

    // Deleting a deleted key has no effect
    const resAgain = await app.request(
      '/api/entries/foo',
      { method: 'DELETE' },
      env
    )
    expect(resAgain).toHaveProperty('status', 200)
    expect(await resAgain.text()).toBe('{"message":"success"}')
  })

  test('invalid key', async () => {
    const res = await app.request(
      '/api/entries/invalid:key',
      { method: 'DELETE' },
      env
    )
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: key cannot contain \\":\\""}'
    )
  })
})
