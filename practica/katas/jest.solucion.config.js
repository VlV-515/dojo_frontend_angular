/**
 * Config de la solución de referencia (equivalente a `go test -tags solucion`).
 *
 * Mismos specs, pero `moduleNameMapper` redirige cada `import ... from './ejercicios'`
 * a `./solucion`. Tu `ejercicios.ts` ni se carga. Úsala para comparar, no para copiar.
 */
const base = require('./jest.config');

module.exports = {
  ...base,
  moduleNameMapper: { '^\\./ejercicios$': './solucion' },
};
