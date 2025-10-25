import { Context } from 'hono'

export const environmentsGet = (c: Context) => {
  console.log('Handling GET request for environments')
  return c.json({ environments: [] })
}

export const environmentsPost = (c: Context) => {
  console.log('Handling POST request for environments')
  return c.json({ message: 'success' })
}
