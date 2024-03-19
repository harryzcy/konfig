import { onRequestGet } from './ping'
import { expect, test } from 'vitest'

test('GET /api/ping', async () => {
  const res = await onRequestGet(null)
  expect(res).toHaveProperty('status', 200)
  expect(await res.text()).toBe('pong')
})
