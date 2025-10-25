import { Context } from 'hono'

export const groupsGet = (c: Context) => {
  console.log('Handling GET request for groups')
  return c.json({ groups: [] })
}

export const groupsPost = (c: Context) => {
  console.log('Handling POST request for groups')
  return c.json({ message: 'success' })
}
