export const successResponse = () => {
  return new Response('{"message":"success"}', {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  })
}

export const jsonResponse = (data: unknown) => {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    }
  })
}

export const notFoundResponse = (desc?: string) => {
  return errorResponse(new Error(desc ?? 'not found'), 404)
}

export const errorResponse = (error: Error, status = 400) => {
  return new Response(
    JSON.stringify({
      error: error.message
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      status
    }
  )
}
