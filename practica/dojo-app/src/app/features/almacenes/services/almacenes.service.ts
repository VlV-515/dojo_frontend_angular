import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@core/http/api-url';
import { Respuesta } from '@core/modelos/respuesta.model';
import { Observable, map } from 'rxjs';
import { Almacen, AlmacenAlta, AlmacenCambio } from '../models/almacen.model';

/**
 * Servicio HTTP tipado de almacenes. Reglas:
 * - Un método por endpoint; devuelve `Observable` (no se suscribe aquí).
 * - Desenvuelve `{ codigo, mensaje, datos }`: quien lo usa recibe `Almacen`, no la envoltura.
 * - No muestra errores ni toasts: eso es del interceptor y del componente.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/almacenes`;

  listar(soloActivos = false): Observable<Almacen[]> {
    const params = soloActivos ? new HttpParams().set('activos', 'true') : undefined;
    return this.http
      .get<Respuesta<Almacen[]>>(this.url, { params })
      .pipe(map((r) => r.datos ?? []));
  }

  obtener(id: number): Observable<Almacen> {
    return this.http.get<Respuesta<Almacen>>(`${this.url}/${id}`).pipe(map((r) => r.datos));
  }

  crear(alta: AlmacenAlta): Observable<Almacen> {
    return this.http.post<Respuesta<Almacen>>(this.url, alta).pipe(map((r) => r.datos));
  }

  actualizar(id: number, cambio: AlmacenCambio): Observable<Almacen> {
    return this.http.put<Respuesta<Almacen>>(`${this.url}/${id}`, cambio).pipe(map((r) => r.datos));
  }
}
