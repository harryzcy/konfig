import { Hono } from 'hono'

const app = new Hono()

app.get('/api/', (c) => c.json({ name: 'Cloudflare' }))
app.get('/api/ping', (c) => c.text('pong'))

export default app
