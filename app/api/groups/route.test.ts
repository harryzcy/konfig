import { POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe } from 'node:test'
import { expect, test } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('POST /api/groups', () => {
  const url = '/api/groups'

  test('success', async () => {
    const req = createRequest('POST', url, '{"name":"project-1"}')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 200)

    expect(await bindings.CONFIG_KV.get('group:project-1')).toBe(
      '{"environments":[]}'
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
    const req = createRequest('POST', url, '{}')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: field name is invalid"}'
    )
  })
})
