const config = {
    trailingComma: 'none',
    tabWidth: 2,
    semi: false,
    singleQuote: true,
    plugins: [
        await import('prettier-plugin-tailwindcss'),
        await import('@trivago/prettier-plugin-sort-imports')
        // 'prettier-plugin-tailwindcss',
        // '@trivago/prettier-plugin-sort-imports'
    ]
}

export default config
