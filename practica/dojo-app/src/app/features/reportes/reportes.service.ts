import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@core/http/api-url';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/reportes`;

  /** CSV de almacenes como Blob (archivo), no como JSON. */
  almacenesCsv(): Observable<Blob> {
    return this.http.get(`${this.url}/almacenes.csv`, { responseType: 'blob' });
  }
}
