import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { API_URL } from '@core/http/api-url';
import { Observable, delay, of, throwError } from 'rxjs';
import { MockDb, TOKEN_MOCK } from './mock-db';

/** Milisegundos de latencia simulada. Los tests la ponen en 0. */
export const MOCK_LATENCIA = new InjectionToken<number>('MOCK_LATENCIA', {
  providedIn: 'root',
  factory: () => 300,
});

type Respuesta = Observable<HttpResponse<unknown>>;

/**
 * Backend falso para trabajar sin el dojo-api (`npm run start:mock`).
 * Responde con el MISMO contrato: `{ codigo, mensaje, datos }` en éxito y
 * `{ codigo, mensaje, detalle }` en error, con los mismos códigos HTTP.
 *
 * Va al FINAL de la cadena de interceptores: así auth, carga y errores
 * funcionan igual que con el backend real.
 */
export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const base = inject(API_URL);
  if (!req.url.startsWith(base)) return next(req);

  const db = inject(MockDb);
  const latencia = inject(MOCK_LATENCIA);
  const [ruta, query = ''] = req.urlWithParams.slice(base.length).split('?');
  const respuesta = resolver(req, ruta, new URLSearchParams(query), db);
  return latencia > 0 ? respuesta.pipe(delay(latencia)) : respuesta;
};

function resolver(
  req: HttpRequest<unknown>,
  ruta: string,
  params: URLSearchParams,
  db: MockDb,
): Respuesta {
  if (req.method === 'GET' && ruta === '/salud') {
    return of(new HttpResponse({ status: 200, body: { estado: 'ok', persistencia: 'mock' } }));
  }
  if (req.headers.get('Authorization') !== `Bearer ${TOKEN_MOCK}`) {
    return error(401, 'No autorizado', 'token inválido');
  }

  const id = /^\/almacenes\/(\d+)$/.exec(ruta);

  if (req.method === 'GET' && ruta === '/almacenes') {
    const soloActivos = params.get('activos') === 'true';
    const datos = db.almacenes.filter((a) => !soloActivos || a.activo);
    return ok(200, 'Almacenes consultados', datos);
  }
  if (req.method === 'POST' && ruta === '/almacenes') {
    const cuerpo = (req.body ?? {}) as { clave?: string; nombre?: string };
    const clave = (cuerpo.clave ?? '').trim().toUpperCase();
    const nombre = (cuerpo.nombre ?? '').trim();
    if (!clave || !nombre) return error(400, 'Los campos clave y nombre son requeridos');
    if (db.almacenes.some((a) => a.clave === clave))
      return error(409, `Ya existe un almacén con la clave ${clave}`);
    const nuevo = { id: db.siguienteId(db.almacenes), clave, nombre, activo: true };
    db.almacenes = [...db.almacenes, nuevo];
    return ok(201, 'Almacén registrado', nuevo);
  }
  if (id && req.method === 'GET') {
    const almacen = db.almacenes.find((a) => a.id === Number(id[1]));
    return almacen ? ok(200, 'Almacén consultado', almacen) : error(404, 'Almacén no encontrado');
  }
  if (id && req.method === 'PUT') {
    const almacen = db.almacenes.find((a) => a.id === Number(id[1]));
    if (!almacen) return error(404, 'Almacén no encontrado');
    const nombre = ((req.body ?? {}) as { nombre?: string }).nombre?.trim() ?? '';
    if (!nombre) return error(400, 'El campo nombre es requerido');
    const cambiado = { ...almacen, nombre };
    db.almacenes = db.almacenes.map((a) => (a.id === cambiado.id ? cambiado : a));
    return ok(200, 'Almacén actualizado', cambiado);
  }
  if (req.method === 'GET' && ruta === '/reportes/almacenes.csv') {
    const filas = db.almacenes.map((a) => `${a.id},${a.clave},${a.nombre},${a.activo}`);
    const csv = ['id,clave,nombre,activo', ...filas].join('\n') + '\n';
    return of(new HttpResponse({ status: 200, body: new Blob([csv], { type: 'text/csv' }) }));
  }
  return error(404, 'Ruta no encontrada en el mock', `${req.method} ${ruta}`);
}

function ok(status: number, mensaje: string, datos: unknown): Respuesta {
  return of(new HttpResponse({ status, body: { codigo: status, mensaje, datos } }));
}

function error(status: number, mensaje: string, detalle = mensaje): Respuesta {
  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        statusText: mensaje,
        error: { codigo: status, mensaje, detalle },
      }),
  );
}
