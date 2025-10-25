import { Context } from 'hono'

export const entriesGet = (c: Context) => {
  console.log('Handling GET request for entries')
  return c.json({ entries: [] })
}

export const entriesPost = (c: Context) => {
  console.log('Handling POST request for entries')
  return c.json({ message: 'success' })
}
