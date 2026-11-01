/**
 * Config normal: los specs importan `./ejercicios`, o sea, TU código.
 * Al principio casi todo sale en rojo. Así empiezan las katas.
 */
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  testMatch: ['<rootDir>/**/*.spec.ts'],
};
