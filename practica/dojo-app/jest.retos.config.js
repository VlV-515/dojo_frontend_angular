/**
 * Jest para los retos: solo corre `*.reto-X.spec.ts`.
 * Empiezan en rojo hasta que resuelves el reto.
 *
 *   npm run reto:a     # módulo 06
 *   npm run reto:b     # módulo 09
 *   npm run reto:c     # módulo 14
 */
const base = require('./jest.config');

module.exports = {
  ...base,
  testMatch: ['<rootDir>/src/**/*.reto-[a-z].spec.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
};
