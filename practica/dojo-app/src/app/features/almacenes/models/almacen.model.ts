/** Almacén tal como lo maneja el front. Coincide 1:1 con `AlmacenDTO` del dojo-api. */
export interface Almacen {
  id: number;
  clave: string;
  nombre: string;
  activo: boolean;
}

/** Cuerpo de `POST /almacenes`. */
export interface AlmacenAlta {
  clave: string;
  nombre: string;
}

/** Cuerpo de `PUT /almacenes/:id`: solo el nombre se puede cambiar. */
export interface AlmacenCambio {
  nombre: string;
}

export type FiltroEstatus = 'todos' | 'activos' | 'inactivos';
