import './style.css'
import { App } from '@/app/App'
import { renderer } from '@/renderer'
import { Hono } from 'hono'

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(App())
})
