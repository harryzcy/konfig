import { onRequestGet, onRequestPost } from '../functions/groups'
import { createContext } from './utils'
import { Env } from '@/types'
import { createExecutionContext } from 'cloudflare:test'
import { waitOnExecutionContext } from 'cloudflare:test'
import { env } from 'cloudflare:test'
import { describe, expect, test } from 'vitest'

describe('GET /api/groups', () => {
  const url = '/api/groups'

  test('empty', async () => {
    // const ctx = createExecutionContext()
    // const req = createRequest('GET', url, null)
    // const params = { slug: 'hello' }
    // const data = {}
    // const eventCtx: Parameters<PagesFunction<Env>>[0] = {
    //   request: new Request(new URL('https://konfig.com' + url)),
    //   functionPath: '',
    //   waitUntil: ctx.waitUntil.bind(ctx),
    //   passThroughOnException: ctx.passThroughOnException.bind(ctx),
    //   async next(input, init) {
    //     const request = new Request(input ?? 'http://placeholder', init)
    //     return new Response(`next:${request.method} ${request.url}`)
    //   },
    //   env: {
    //     ...env,
    //     ASSETS: {
    //       async fetch(input: any, init: any) {
    //         const request = new Request(input, init)
    //         return new Response(`ASSETS:${request.method} ${request.url}`)
    //       }
    //     }
    //   },
    //   params,
    //   data
    // }
    const ctx = createExecutionContext()
    const eventCtx = createContext(ctx, 'GET', url, null)
    const res = await onRequestGet(eventCtx)
    await waitOnExecutionContext(ctx)
    expect(res).toHaveProperty('status', 200)
    expect(await res.json()).toEqual({ groups: [] })
  })

  // test('non-empty', async () => {
  //   {
  //     const req = createRequest('POST', url, '{"name":"project-1"}')
  //     const res = await onRequestPost.call(req)
  //     expect(res).toHaveProperty('status', 200)
  //   }

  //   const req = createRequest('GET', url, null)
  //   const res = await onRequestGet.call(req)
  //   expect(res).toHaveProperty('status', 200)
  //   const result = await res.json()
  //   expect(result).toHaveProperty('groups')
  //   expect(result['groups']).toHaveLength(1)
  //   expect(result['groups']).toBeInstanceOf(Array)
  //   expect(result['groups']).toContain('project-1')
  // })
})

// describe('POST /api/groups', () => {
//   const url = '/api/groups'

//   test('success', async () => {
//     const req = createRequest('POST', url, '{"name":"project-1"}')
//     const res = await onRequestPost.call(req)
//     expect(res).toHaveProperty('status', 200)

//     expect(await env.CONFIG_KV.get('group:project-1')).toBe(
//       '{"environments":[]}'
//     )
//     await env.CONFIG_KV.delete('group:project-1')
//   })

//   test('invalid json', async () => {
//     const req = createRequest('POST', url, 'invalid input')
//     const res = await onRequestPost.call(req)
//     expect(res).toHaveProperty('status', 400)
//     expect(await res.text()).toBe(
//       '{"error":"invalid input: input is not valid JSON"}'
//     )
//     expect(
//       await env.CONFIG_KV.list({
//         prefix: 'group:'
//       })
//     ).toHaveProperty('keys', [])
//   })

//   test('zod validation failed', async () => {
//     const req = createRequest('POST', url, '{}')
//     const res = await onRequestPost.call(req)
//     expect(res).toHaveProperty('status', 400)
//     expect(await res.text()).toBe(
//       '{"error":"invalid input: field name is invalid"}'
//     )
//     expect(
//       await env.CONFIG_KV.list({
//         prefix: 'group:'
//       })
//     ).toHaveProperty('keys', [])
//   })
// })
