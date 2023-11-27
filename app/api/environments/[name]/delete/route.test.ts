import { POST } from './route'
import { Env } from '@/src/types'
import { createRequest } from '@/test/utils'
import { describe, expect, test, vi } from 'vitest'

const bindings = getMiniflareBindings() as Env

describe('POST /api/environments/[name]/delete', () => {
  const url = '/api/environments/production/delete'

  test('success', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: [] }),
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

    await expect(
      bindings.CONFIG_KV.get('env:production')
    ).resolves.toBeDefined()

    // Deleting again should give 400, already soft deleted
    const resAgain = await POST(req)
    expect(resAgain).toHaveProperty('status', 400)
    expect(await resAgain.text()).toBe(
      '{"error":"Environment production is already soft deleted"}'
    )
  })

  test('has groups', async () => {
    await bindings.CONFIG_KV.put(
      'env:production',
      JSON.stringify({ groups: ['project-1'] }),
      {
        metadata: {
          created: 123
        }
      }
    )

    const req = createRequest('POST', url, null)
    const res = await POST(req)
    expect(res).toHaveProperty('status', 400)
    expect(await res.text()).toBe(
      '{"error":"Environment production has groups"}'
    )
  })

  test('404 not found', async () => {
    const req = createRequest('GET', '/api/environments/not-found/delete', null)
    const res = await POST(req)
    expect(res).toHaveProperty('status', 404)
    expect(await res.text()).toBe('{"error":"not found"}')
  })

  test('empty name', async () => {
    const req = createRequest('POST', '', null)
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe(
      '{"error":"invalid input: environment name is not defined"}'
    )
  })
})
