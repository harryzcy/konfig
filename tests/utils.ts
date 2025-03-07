import { Env } from '@/common/types'
import { env } from 'cloudflare:test'

export function createContext(
  ctx: ExecutionContext,
  method: string,
  path: string,
  body: BodyInit | null | undefined,
  headers = {}
): Parameters<PagesFunction<Env>>[0] {
  const data = {}
  return {
    request: new Request(new URL('https://konfig.com' + path), {
      method,
      body,
      headers
    }),
    functionPath: path,
    waitUntil: ctx.waitUntil.bind(ctx),
    passThroughOnException: ctx.passThroughOnException.bind(ctx),
    async next(input, init) {
      const request = new Request(input ?? 'https://konfig.com', init)
      return new Response(`next:${request.method} ${request.url}`)
    },
    env: {
      ...env,
      ASSETS: {
        async fetch(input: any, init: any) {
          const request = new Request(input, init)
          return new Response(`ASSETS:${request.method} ${request.url}`)
        }
      }
    },
    params: {},
    data
  }
}
