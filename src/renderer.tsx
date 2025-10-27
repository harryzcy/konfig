import { reactRenderer } from '@hono/react-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'

export const renderer = reactRenderer(({ children }) => {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Konfig</title>
        <meta
          name="description"
          content="Centralized configuration infrastructure"
        />
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
})
