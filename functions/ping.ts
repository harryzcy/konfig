import { jsonResponse } from '@/response'

export const onRequestGet: PagesFunction = async () => {
  return jsonResponse({
    message: 'pong'
  })
}
