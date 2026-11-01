/**
 * Jest para la base de dojo-app (en verde).
 *
 * Los specs de los retos (`*.reto-a.spec.ts`, `*.reto-b.spec.ts`, `*.reto-c.spec.ts`)
 * quedan FUERA de esta corrida, igual que los build tags del dojo de backend:
 * sin pedirlos no se compilan y la base sigue en verde. Se corren con
 * `npm run reto:a|b|c` (ver jest.retos.config.js).
 */
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.reto-[a-z]\\.spec\\.ts$'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.html$' },
    ],
  },
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.spec.ts', '!src/app/**/*.routes.ts'],
};
