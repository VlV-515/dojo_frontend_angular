import { Injectable } from '@angular/core';

/** Igual que el token por default del dojo-api, para que el mock se porte igual. */
export const TOKEN_MOCK = 'dojo-local-inseguro';

/** Forma en la que el dojo-api manda un almacén (JSON en snake/camel tal cual). */
export interface AlmacenMock {
  id: number;
  clave: string;
  nombre: string;
  activo: boolean;
}

const SEMILLA: readonly AlmacenMock[] = [
  { id: 1, clave: 'ALM-01', nombre: 'Almacén Centro', activo: true },
  { id: 2, clave: 'ALM-02', nombre: 'Almacén Norte', activo: true },
  { id: 3, clave: 'ALM-03', nombre: 'Almacén Sur', activo: false },
  { id: 4, clave: 'ALM-04', nombre: 'Almacén Oriente', activo: true },
  { id: 5, clave: 'ALM-05', nombre: 'Almacén Poniente', activo: true },
  { id: 6, clave: 'ALM-06', nombre: 'Bodega Aeropuerto', activo: true },
  { id: 7, clave: 'ALM-07', nombre: 'Bodega Puerto', activo: false },
  { id: 8, clave: 'ALM-08', nombre: 'Cedis Bajío', activo: true },
  { id: 9, clave: 'ALM-09', nombre: 'Cedis Occidente', activo: true },
  { id: 10, clave: 'ALM-10', nombre: 'Cedis Sureste', activo: true },
  { id: 11, clave: 'ALM-11', nombre: 'Tienda Matriz', activo: true },
  { id: 12, clave: 'ALM-12', nombre: 'Tienda Plaza', activo: false },
];

/**
 * "Base de datos" en memoria del mock. Imita las reglas del dojo-api (clave
 * única en mayúsculas, nombre recortado) para que la app se comporte igual con
 * o sin backend. Vive mientras la pestaña esté abierta.
 */
@Injectable({ providedIn: 'root' })
export class MockDb {
  almacenes: AlmacenMock[] = SEMILLA.map((a) => ({ ...a }));

  reiniciar(): void {
    this.almacenes = SEMILLA.map((a) => ({ ...a }));
  }

  siguienteId(lista: readonly { id: number }[]): number {
    return lista.reduce((max, x) => Math.max(max, x.id), 0) + 1;
  }
}
