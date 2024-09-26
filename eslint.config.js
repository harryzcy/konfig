// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextPlugin from 'eslint-config-next'
import nextOnPages from 'eslint-plugin-next-on-pages'

export default tseslint.config(
  {
    ignores: ['bin/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  // @ts-ignore
  ...nextOnPages.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2020,
      },
    },
    rules: {
      semi: [2, 'never'],
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
)
