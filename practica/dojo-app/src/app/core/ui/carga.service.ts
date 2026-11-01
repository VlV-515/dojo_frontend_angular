import { Injectable, computed, signal } from '@angular/core';

/**
 * Cuenta las peticiones en curso. Con un contador (y no un booleano) dos
 * peticiones simultáneas no apagan el indicador antes de tiempo.
 */
@Injectable({ providedIn: 'root' })
export class CargaService {
  private readonly pendientes = signal(0);
  readonly cargando = computed(() => this.pendientes() > 0);

  iniciar(): void {
    this.pendientes.update((n) => n + 1);
  }

  terminar(): void {
    this.pendientes.update((n) => Math.max(0, n - 1));
  }
}
