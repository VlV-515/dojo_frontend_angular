/**
 * Envoltura de toda respuesta exitosa del dojo-api: `{ codigo, mensaje, datos }`.
 * Casi toda API empresarial tiene una envoltura así; tiparla con un genérico
 * evita el `any` que se propaga por toda la app.
 */
export interface Respuesta<T> {
  codigo: number;
  mensaje: string;
  datos: T;
}

/** Cuerpo de error del dojo-api: `{ codigo, mensaje, detalle }`. */
export interface RespuestaError {
  codigo: number;
  mensaje: string;
  detalle?: string;
}
