import { onRequestGet } from '@functions/api/ping'
import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { env } from 'cloudflare:workers'
import { test, expect } from 'vitest'

test('GET /api/ping', async () => {
  const request = new Request('http://example.com/ping')
  const ctx = createExecutionContext()
  const response = await onRequestGet.call(request, env, ctx)
  await waitOnExecutionContext(ctx)
  expect(await response.text()).toMatchInlineSnapshot(`"{"message":"pong"}"`)
})
