import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/**', 'playwright-report/**', 'playwright-report-dev/**', 'test-results/**', '.tmp/**', 'artifacts/**', 'docs/audits/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks }, rules: { ...reactHooks.configs.recommended.rules } },
)
