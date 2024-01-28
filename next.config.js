/** @type {import('next').NextConfig} */

if (process.env.NODE_ENV === 'development') {
  // import the utility from the next-dev submodule
  const { setupDevBindings } = require('@cloudflare/next-on-pages/next-dev')

  // call the utility with the bindings you want to have access to
  setupDevBindings({
    bindings: {
      CONFIG_KV: {
        type: 'kv',
        id: 'CONFIG_KV'
      }
    }
  })
}

const nextConfig = {}

module.exports = nextConfig
