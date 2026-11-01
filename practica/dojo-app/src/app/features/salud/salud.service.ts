import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@core/http/api-url';
import { silencioso } from '@core/http/contexto';
import { Observable } from 'rxjs';

/** `/salud` NO usa la envoltura `{ codigo, mensaje, datos }`: así responde el dojo-api. */
export interface EstadoSalud {
  estado: string;
  persistencia: string;
}

@Injectable({ providedIn: 'root' })
export class SaludService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/salud`;

  consultar(): Observable<EstadoSalud> {
    // silencioso(): si el backend está caído, esta pantalla lo dice a su manera; sin toast.
    return this.http.get<EstadoSalud>(this.url, { context: silencioso() });
  }
}
