import { entriesPost, entryGet, entryHardDelete } from './api/entries'
import {
  environmentGet,
  environmentHardDelete,
  environmentsGet,
  environmentSoftDelete,
  environmentsPost
} from './api/environments'
import {
  groupGet,
  groupHardDelete,
  groupLink,
  groupsGet,
  groupSoftDelete,
  groupsPost
} from './api/groups'
import { App } from './app/App'
import { Bindings } from './common/bindings'
import './index.css'
import { renderer } from './renderer'
import { Hono } from 'hono'

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(App())
})

const api = new Hono()

api.get('/environments', environmentsGet)
api.post('/environments', environmentsPost)
api.get('/environments/:name', environmentGet)
api.delete('/environments/:name', environmentHardDelete)
api.post('/environments/:name/delete', environmentSoftDelete)

api.get('/groups', groupsGet)
api.post('/groups', groupsPost)
api.get('/groups/:name', groupGet)
api.delete('/groups/:name', groupHardDelete)
api.post('/groups/:name/delete', groupSoftDelete)
api.post('/groups/:name/link', groupLink)

api.post('/entries', entriesPost)
api.get('/entries/:key', entryGet)
api.delete('/entries/:key', entryHardDelete)

api.get('/ping', (c) => {
  return c.json({ message: 'pong' })
})

app.route('/api', api)

export default app
