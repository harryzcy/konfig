import app from '../src'
import { env, createExecutionContext } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'
import { a } from 'vitest/dist/chunks/suite.d.FvehnV49.js'

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
