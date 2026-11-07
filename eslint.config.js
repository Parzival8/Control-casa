// Configuración de ESLint (formato "flat config") con las reglas de Expo.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*'],
  },
  {
    // Los tests usan las variables globales de Jest (describe, test, expect…).
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
      },
    },
  },
]);
