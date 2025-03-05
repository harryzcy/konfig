import { GET } from './route'
import { expect, test } from 'vitest'

test('GET /api/ping', async () => {
  const res = await GET()
  expect(res).toHaveProperty('status', 200)
  expect(await res.text()).toBe('pong')
})
