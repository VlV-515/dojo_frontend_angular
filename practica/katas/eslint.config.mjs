// @ts-check
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', '*.js', '*.mjs'] },
  ...tseslint.configs.recommended,
  {
    // Los esqueletos traen parámetros que todavía no usas: no es un error, es tu TODO.
    files: ['**/ejercicios.ts'],
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },
);
