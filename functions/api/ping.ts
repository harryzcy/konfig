import { jsonResponse } from '@/common/response'

export const onRequestGet: PagesFunction = async () => {
  return jsonResponse({
    message: 'pong'
  })
}
