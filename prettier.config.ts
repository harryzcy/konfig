const plugins = []

try {
  await import('prettier-plugin-tailwindcss')
  plugins.push('prettier-plugin-tailwindcss')
} catch (error) {
  console.warn('Error loading prettier-plugin-tailwindcss:', error)
}
try {
  await import('@trivago/prettier-plugin-sort-imports')
  plugins.push('@trivago/prettier-plugin-sort-imports')
} catch (error) {
  console.warn('Error loading @trivago/prettier-plugin-sort-imports:', error)
}

const config = {
  trailingComma: 'none',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  plugins
}

export default config
