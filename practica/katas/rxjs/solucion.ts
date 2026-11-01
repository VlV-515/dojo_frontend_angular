// Solución de referencia. Solo se usa con `npm run test:solucion`.
import { Observable, catchError, combineLatest, concatMap, debounceTime, distinctUntilChanged, map, of, retry, shareReplay, startWith, switchMap } from 'rxjs';
import { Almacen, EstadoCarga } from './tipos';

export function soloActivos(almacenes$: Observable<Almacen[]>): Observable<Almacen[]> {
  return almacenes$.pipe(
    map((lista) => lista.filter((a) => a.activo).sort((a, b) => a.nombre.localeCompare(b.nombre))),
  );
}

export function buscador<R>(
  texto$: Observable<string>,
  buscar: (texto: string) => Observable<R[]>,
  ms: number,
): Observable<R[]> {
  return texto$.pipe(
    debounceTime(ms),
    map((t) => t.trim()),
    distinctUntilChanged(),
    switchMap((t) => (t.length < 2 ? of([]) : buscar(t))),
  );
}

export function conEstado<T>(peticion$: Observable<T>): Observable<EstadoCarga<T>> {
  return peticion$.pipe(
    map((datos): EstadoCarga<T> => ({ estado: 'listo', datos })),
    startWith<EstadoCarga<T>>({ estado: 'cargando' }),
    catchError((err: Error) => of<EstadoCarga<T>>({ estado: 'error', mensaje: err.message })),
  );
}

export function filtrar(almacenes$: Observable<Almacen[]>, texto$: Observable<string>): Observable<Almacen[]> {
  return combineLatest([almacenes$, texto$]).pipe(
    map(([lista, texto]) => {
      const t = texto.trim().toLowerCase();
      if (!t) return lista;
      return lista.filter((a) => a.clave.toLowerCase().includes(t) || a.nombre.toLowerCase().includes(t));
    }),
  );
}

export function guardarEnOrden<R>(ids$: Observable<number>, guardar: (id: number) => Observable<R>): Observable<R> {
  return ids$.pipe(concatMap((id) => guardar(id)));
}

export function conReintentos<T>(fuente$: Observable<T>, veces: number): Observable<T> {
  return fuente$.pipe(retry(veces));
}

export function cachear<T>(fuente$: Observable<T>): Observable<T> {
  return fuente$.pipe(shareReplay({ bufferSize: 1, refCount: false }));
}
