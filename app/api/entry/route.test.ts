import { POST } from './route'
import { createRequest } from '@/test/utils'
import { describe } from 'node:test'
import { expect, test } from 'vitest'

describe('POST /api/entry', () => {
  test('success', async () => {
    const req = createRequest(
      'POST',
      '/api/entry',
      '{"type":"text", "key": "foo", "value":"test"}'
    )
    const res = await POST(req)
    expect(res).toHaveProperty('status', 200)
  })

  test('invalid json', async () => {
    const req = createRequest('POST', '/api/entry', 'invalid input')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
  })

  test('zod validation failed', async () => {
    const req = createRequest('POST', '/api/entry', '{"type":"text"}')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: fields key, value are invalid"}'
    )
  })
})
