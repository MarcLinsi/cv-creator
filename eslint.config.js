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
  },
  {
    // Un template n'exporte pas un composant mais un descripteur de mise en page
    // (colonnes, cadre, titres, construction des blocs) — voir templates/index.js.
    // Fast Refresh ne sait pas recharger ça à chaud : éditer un template
    // provoque un rechargement complet, ce qui est le prix assumé du contrat.
    files: ['src/templates/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
