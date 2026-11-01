// Tipos compartidos por las katas de TypeScript. NO se editan.

/** Un almacén tal como lo devuelve el dojo-api (`GET /almacenes`). */
export interface Almacen {
  id: number;
  clave: string;
  nombre: string;
  activo: boolean;
}

/** Envoltura estándar de toda respuesta exitosa del dojo-api. */
export interface Respuesta<T> {
  codigo: number;
  mensaje: string;
  datos: T;
}

/** Estado de una petición: unión discriminada por `tipo`. */
export type EstadoPeticion<T> =
  | { tipo: 'inactivo' }
  | { tipo: 'cargando' }
  | { tipo: 'exito'; datos: T }
  | { tipo: 'error'; mensaje: string };

/** Una página de resultados. */
export interface Pagina<T> {
  items: T[];
  pagina: number;
  total: number;
  paginas: number;
}
