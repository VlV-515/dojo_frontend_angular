import { Almacen, EstadoPeticion, Pagina, Respuesta } from './tipos';

// ---------------------------------------------------------------------------
// Kata 1. Strings
// ---------------------------------------------------------------------------

/**
 * normalizarClave quita espacios de los extremos, pasa a MAYÚSCULAS y cambia
 * cada grupo de espacios internos por un solo guion.
 * "  alm  centro 01 " -> "ALM-CENTRO-01". Cadena vacía o solo espacios -> "".
 * Pista: `trim`, `toUpperCase` y `replace` con una expresión regular.
 */
export function normalizarClave(clave: string): string {
  // TODO: tu código aquí
  return clave;
}

// ---------------------------------------------------------------------------
// Kata 2. Genéricos
// ---------------------------------------------------------------------------

/**
 * agruparPor arma un objeto donde cada llave es lo que devuelve `llave(item)`
 * y cada valor es la lista de items con esa llave, en el orden original.
 * Pista: `reduce` o un `for...of`; el tipo de retorno ya está resuelto.
 */
export function agruparPor<T, K extends PropertyKey>(items: T[], llave: (item: T) => K): Record<K, T[]> {
  // TODO: tu código aquí
  return {} as Record<K, T[]>;
}

/**
 * paginar devuelve la página `pagina` (empieza en 1) de tamaño `tamano`.
 * `paginas` es el total de páginas (0 si no hay items). Una página fuera de
 * rango devuelve `items: []` pero conserva `total` y `paginas`.
 * Lanza `RangeError` si `pagina < 1` o `tamano < 1`.
 */
export function paginar<T>(items: T[], pagina: number, tamano: number): Pagina<T> {
  // TODO: tu código aquí
  return { items: [], pagina, total: 0, paginas: 0 };
}

// ---------------------------------------------------------------------------
// Kata 3. Inmutabilidad y utility types
// ---------------------------------------------------------------------------

/**
 * actualizar devuelve un objeto NUEVO con los cambios aplicados. Nunca muta
 * `original`. Las llaves con valor `undefined` en `cambios` se ignoran.
 * Pista: spread y `Object.entries`; en Angular esto es lo que permite que
 * OnPush y los signals detecten el cambio.
 */
export function actualizar<T extends object>(original: T, cambios: Partial<T>): T {
  // TODO: tu código aquí
  return original;
}

// ---------------------------------------------------------------------------
// Kata 4. Uniones discriminadas y narrowing
// ---------------------------------------------------------------------------

/**
 * describirEstado devuelve un texto para la UI:
 * - inactivo -> "Sin consultar"
 * - cargando -> "Cargando…"
 * - exito    -> "N registros" (N = datos.length; "1 registro" en singular)
 * - error    -> "Error: <mensaje>"
 * Pista: `switch (estado.tipo)`. Agrega un `default` que asigne a `never`
 * para que el compilador te avise si alguien agrega un estado nuevo.
 */
export function describirEstado(estado: EstadoPeticion<unknown[]>): string {
  // TODO: tu código aquí
  return '';
}

// ---------------------------------------------------------------------------
// Kata 5. unknown y type guards
// ---------------------------------------------------------------------------

/**
 * esAlmacen es un type guard: true solo si `valor` es un objeto con `id`
 * number, `clave` y `nombre` string, y `activo` boolean.
 */
export function esAlmacen(valor: unknown): valor is Almacen {
  // TODO: tu código aquí
  return false;
}

/**
 * leerAlmacenes valida lo que llegó del backend (como `unknown`, porque no
 * confías en la red) y devuelve los datos tipados. Lanza `Error` con el
 * mensaje "Respuesta inválida" si no es `{ codigo: number, mensaje: string,
 * datos: Almacen[] }`.
 */
export function leerAlmacenes(json: unknown): Respuesta<Almacen[]> {
  // TODO: tu código aquí
  return json as Respuesta<Almacen[]>;
}

// ---------------------------------------------------------------------------
// Kata 6. async/await
// ---------------------------------------------------------------------------

/**
 * conReintentos llama a `fn` hasta que resuelva o se acaben los `intentos`
 * (intentos >= 1). Si todos fallan, rechaza con el ÚLTIMO error.
 */
export async function conReintentos<T>(fn: () => Promise<T>, intentos: number): Promise<T> {
  // TODO: tu código aquí
  return fn();
}
