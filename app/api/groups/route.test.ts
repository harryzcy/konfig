import { GET, POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe } from 'node:test'
import { expect, test } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('GET /api/groups', () => {
  const url = '/api/groups'

  test('empty', async () => {
    const req = createRequest('GET', url, null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    expect(await res.json()).toEqual({ keys: [] })
  })

  test('non-empty', async () => {
    {
      const req = createRequest('POST', url, '{"name":"project-1"}')
      const res = await POST(req)
      expect(res).toHaveProperty('status', 200)
    }

    const req = createRequest('GET', url, null)
    const res = await GET(req)
    expect(res).toHaveProperty('status', 200)
    const result = await res.json()
    expect(result).toHaveProperty('keys')
    expect(result['keys']).toHaveLength(1)
    expect(result['keys']).toBeInstanceOf(Array)
    expect(result['keys']).toContain('project-1')
  })
})

describe('POST /api/groups', () => {
  const url = '/api/groups'

  test('success', async () => {
    const req = createRequest('POST', url, '{"name":"project-1"}')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 200)

    expect(await bindings.CONFIG_KV.get('group:project-1')).toBe(
      '{"environments":[]}'
    )
    await bindings.CONFIG_KV.delete('group:project-1')
  })

  test('invalid json', async () => {
    const req = createRequest('POST', url, 'invalid input')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: input is not valid JSON"}'
    )
    expect(
      await bindings.CONFIG_KV.list({
        prefix: 'group:'
      })
    ).toHaveProperty('keys', [])
  })

  test('zod validation failed', async () => {
    const req = createRequest('POST', url, '{}')
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: field name is invalid"}'
    )
    expect(
      await bindings.CONFIG_KV.list({
        prefix: 'group:'
      })
    ).toHaveProperty('keys', [])
  })
})
