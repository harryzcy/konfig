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

export const notFoundResponse = () => {
  return errorResponse(new Error('not found'), 404)
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
