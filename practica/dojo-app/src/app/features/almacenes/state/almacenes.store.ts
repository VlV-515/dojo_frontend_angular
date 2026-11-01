import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorApp } from '@core/errores/error-app';
import { Observable, tap } from 'rxjs';
import { Almacen, AlmacenAlta, AlmacenCambio, FiltroEstatus } from '../models/almacen.model';
import { AlmacenesService } from '../services/almacenes.service';

/**
 * Store de almacenes con signals: una sola fuente de verdad para la lista,
 * los filtros y el estado de carga. Las pantallas LEEN signals y llaman
 * métodos; nunca mutan el arreglo directo.
 *
 * Regla de oro: cada cambio crea un arreglo NUEVO (`[...lista, x]`, `map`),
 * así `computed`, OnPush y `@for ... track` detectan el cambio.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenesStore {
  private readonly service = inject(AlmacenesService);

  private readonly _almacenes = signal<Almacen[]>([]);
  readonly almacenes = this._almacenes.asReadonly();
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly texto = signal('');
  readonly estatus = signal<FiltroEstatus>('todos');

  /** Lista ya filtrada por texto (clave o nombre) y por estatus. */
  readonly filtrados = computed(() => {
    const texto = this.texto().trim().toLowerCase();
    const estatus = this.estatus();
    return this._almacenes().filter((a) => {
      const coincideEstatus = estatus === 'todos' || (estatus === 'activos' ? a.activo : !a.activo);
      const coincideTexto =
        texto === '' ||
        a.clave.toLowerCase().includes(texto) ||
        a.nombre.toLowerCase().includes(texto);
      return coincideEstatus && coincideTexto;
    });
  });

  readonly totalActivos = computed(() => this._almacenes().filter((a) => a.activo).length);

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.service.listar().subscribe({
      next: (lista) => {
        this._almacenes.set(lista);
        this.cargando.set(false);
      },
      error: (err: ErrorApp) => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  crear(alta: AlmacenAlta): Observable<Almacen> {
    return this.service
      .crear(alta)
      .pipe(tap((nuevo) => this._almacenes.update((lista) => [...lista, nuevo])));
  }

  actualizar(id: number, cambio: AlmacenCambio): Observable<Almacen> {
    return this.service.actualizar(id, cambio).pipe(tap((almacen) => this.reemplazar(almacen)));
  }

  /** Sustituye un almacén de la lista por su versión nueva (inmutable). */
  private reemplazar(almacen: Almacen): void {
    this._almacenes.update((lista) => lista.map((a) => (a.id === almacen.id ? almacen : a)));
  }
}
