// Tipos compartidos por las katas de RxJS. NO se editan.

export interface Almacen {
  id: number;
  clave: string;
  nombre: string;
  activo: boolean;
}

/** Lo que una pantalla necesita para pintar una carga: datos, spinner y error. */
export type EstadoCarga<T> =
  | { estado: 'cargando' }
  | { estado: 'listo'; datos: T }
  | { estado: 'error'; mensaje: string };
