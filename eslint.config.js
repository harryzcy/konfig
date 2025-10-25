// @ts-check
import eslint from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'
import tsEslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['dist/', 'node_modules/']
  },
  eslint.configs.recommended,
  ...tsEslint.configs.strictTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024
      }
    },
    rules: {
      semi: [2, 'never']
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.js'],
    ...tsEslint.configs.disableTypeChecked
  }
)
