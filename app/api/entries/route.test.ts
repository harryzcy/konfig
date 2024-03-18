import { POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe, expect, test } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('POST /api/entries', () => {
  const url = '/api/entries'

  test('success', async () => {
    const req = createRequest(
      'POST',
      url,
      '{"type":"text", "key": "foo", "value":"test"}'
    )
    const res = await POST(req)
    expect(res).toHaveProperty('status', 200)

    expect(await bindings.CONFIG_KV.get('entry:foo')).toBe(
      '{"type":"text","value":"test"}'
    )
  })

  test('invalid json', async () => {
    const req = createRequest('POST', url, 'invalid input')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
  })

  test('zod validation failed', async () => {
    const req = createRequest('POST', url, '{"type":"text"}')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: fields key, value are invalid"}'
    )
  })
})
