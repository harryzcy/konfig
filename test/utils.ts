process.env = getMiniflareBindings() as any

export function createRequest(
  method: string,
  path: string,
  body: BodyInit | null,
  headers = {}
) {
  return new Request(new URL('https://konfig.com' + path), {
    method,
    body: body,
    headers
  })
}
