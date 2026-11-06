// Configuración de Jest SOLO para los tests de reglas de Firestore.
// Se ejecutan contra el emulador con: npm run test:rules
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/reglas/**/*.test.js'],
  transform: {},
  testTimeout: 20000,
};
