import { onRequestGet } from '@functions/api/ping'
import {
  env,
  createExecutionContext,
  waitOnExecutionContext
} from 'cloudflare:test'
import { test, expect } from 'vitest'

test('GET /api/ping', async () => {
  const request = new Request('http://example.com/ping')
  const ctx = createExecutionContext()
  const response = await onRequestGet.call(request, env, ctx)
  await waitOnExecutionContext(ctx)
  expect(await response.text()).toMatchInlineSnapshot(`"{"message":"pong"}"`)
})
