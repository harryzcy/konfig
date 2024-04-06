import { POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe } from 'node:test'
import { expect, test } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('POST /api/environments', () => {
  test('success', async () => {
    const req = createRequest(
      'POST',
      '/api/environments',
      '{"name":"production"}'
    )
    const res = await POST(req)
    expect(res).toHaveProperty('status', 200)

    expect(await bindings.CONFIG_KV.get('env:production')).toBe('{"groups":[]}')
  })

  test('invalid json', async () => {
    const req = createRequest('POST', '/api/environments', 'invalid input')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
  })

  test('zod validation failed', async () => {
    const req = createRequest('POST', '/api/environments', '{}')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: field name is invalid"}'
    )
  })
})
