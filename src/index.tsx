import { entriesPost } from './api/entries'
import { environmentsGet, environmentsPost } from './api/environments'
import { groupsGet, groupsPost } from './api/groups'
import { Bindings } from './common/bindings'
import { renderer } from './renderer'
import { Hono } from 'hono'

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

const api = new Hono()

api.get('/environments', environmentsGet)
api.post('/environments', environmentsPost)

api.get('/groups', groupsGet)
api.post('/groups', groupsPost)

api.post('/entries', entriesPost)

api.get('/ping', (c) => {
  return c.json({ message: 'pong' })
})

app.route('/api', api)

export default app
