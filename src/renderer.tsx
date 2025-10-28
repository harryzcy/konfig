import { reactRenderer } from '@hono/react-renderer'

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
        <link href="./style.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
})
