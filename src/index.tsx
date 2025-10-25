import { renderer } from './renderer'
import { Hono } from 'hono'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

const api = new Hono()

api.get('/ping', (c) => {
  return c.json({ message: 'pong' })
})

app.route('/api', api)

export default app
