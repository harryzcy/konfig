import { Context } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'

export const successResponse = (c: Context) => {
  return c.json({ message: 'success' })
}

export const notFoundResponse = (c: Context, desc?: string) => {
  return errorResponse(c, new Error(desc ?? 'not found'), 404)
}

export const errorResponse = (
  c: Context,
  error: Error,
  status: ContentfulStatusCode = 400
) => {
  return c.json(
    {
      error: error.message
    },
    status
  )
}
