import { reactRenderer } from '@hono/react-renderer'
import { css, Style } from 'hono/css'

export const renderer = reactRenderer(
  ({ children }) => {
    const globalClass = css`
      @import 'tailwindcss';
    `

    return (
      <html>
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Konfig</title>
          <meta
            name="description"
            content="Centralized configuration infrastructure"
          />
          <link href="/src/style.css" rel="stylesheet" />
          <Style>{globalClass}</Style>
        </head>
        <body>{children}</body>
      </html>
    )
  },
  {
    stream: true
  }
)
