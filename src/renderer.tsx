import manifest from './lib/manifest.json'
import { reactRenderer } from '@hono/react-renderer'
import { MiddlewareHandler } from 'hono'
import React from 'react'

export const renderer: MiddlewareHandler = async (c, next) => {
  console.log('Renderer manifest:', manifest)

  const cssDoms: React.ReactNode[] = []

  for (const [, value] of Object.entries(manifest)) {
    if (!value.isEntry) continue
    if (value.css && value.css.length > 0) {
      for (const cssFile of value.css) {
        cssDoms.push(
          <link key={cssFile} rel="stylesheet" href={`/${cssFile}`} />
        )
      }
    }
  }

  const renderDOM = reactRenderer(({ children }) => {
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
          {cssDoms}
        </head>
        <body>{children}</body>
      </html>
    )
  })
  await renderDOM(c, next)
}
