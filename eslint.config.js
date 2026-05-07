import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Async data fetching inside `useEffect` is the standard pattern for
      // simple SPAs without a query library; React 19's strict rule trips on
      // these benign fetch-then-setState flows. Turned off project-wide.
      'react-hooks/set-state-in-effect': 'off',
      // We import `React` only when needed (React 17+ JSX transform).
      'react-refresh/only-export-components': 'warn',
    },
  },
])
