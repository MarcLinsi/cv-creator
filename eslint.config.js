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
    // Deux endroits n'exportent pas que des composants, par conception :
    //   - un template exporte un descripteur de mise en page (colonnes, cadre,
    //     titres, construction des blocs) — voir templates/index.js ;
    //   - i18n expose son provider avec le registre des langues et le hook.
    // Fast Refresh ne sait pas recharger ça à chaud : les éditer provoque un
    // rechargement complet, prix assumé de ces deux contrats.
    files: ['src/templates/*.jsx', 'src/i18n/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
