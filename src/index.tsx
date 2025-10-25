import { renderer } from './renderer'
import { Hono } from 'hono'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

export default app
