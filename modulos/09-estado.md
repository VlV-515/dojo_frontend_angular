# 09 · Estado con signals

> Cinturón azul · 2–3 días

## Objetivos

- Distinguir estado local, estado de feature y estado global.
- Construir un store con signals: estado privado, lectura pública, métodos que lo cambian.
- Derivar datos con `computed` en vez de duplicarlos.
- Actualizar de forma inmutable y optimista o pesimista, con criterio.
- Saber cuándo vale la pena una librería (NgRx Signal Store, NgRx Store).

## 1. ¿Dónde vive cada dato?

| Tipo | Ejemplo | Dónde |
|---|---|---|
| Local de un componente | ¿El formulario está guardando? | `signal` en el componente |
| De la URL | Página, filtro compartible, id | Parámetros de ruta / query params |
| De una feature | Lista de almacenes + filtros | Store de la feature (`providedIn: 'root'` o de ruta) |
| Global | Sesión, permisos, indicador de carga | Servicios en `core/` |

Regla: el estado vive en el lugar **más bajo** que sirve a todos sus lectores. Un dato global que solo usa una pantalla es una fuente de bugs.

## 2. Un store con signals

[`almacenes.store.ts`](../practica/dojo-app/src/app/features/almacenes/state/almacenes.store.ts):

```ts
@Injectable({ providedIn: 'root' })
export class AlmacenesStore {
  private readonly _almacenes = signal<Almacen[]>([]);
  readonly almacenes = this._almacenes.asReadonly();      // nadie de fuera puede hacer .set()
  readonly texto = signal('');
  readonly estatus = signal<FiltroEstatus>('todos');

  readonly filtrados = computed(() => /* filtra _almacenes por texto y estatus */);
  readonly totalActivos = computed(() => this._almacenes().filter((a) => a.activo).length);

  crear(alta: AlmacenAlta): Observable<Almacen> {
    return this.service.crear(alta).pipe(tap((nuevo) => this._almacenes.update((l) => [...l, nuevo])));
  }
}
```

Principios:

1. **Una sola fuente de verdad.** La lista vive aquí; las pantallas la leen. Nada de copias en cada componente.
2. **Lectura pública, escritura privada.** `asReadonly()` o métodos con nombre del negocio (`crear`, `actualizar`).
3. **Derivar, no duplicar.** `filtrados` y `totalActivos` son `computed`; no se guardan aparte ni se recalculan a mano.
4. **Inmutable.** `update((l) => [...l, x])` y `map(...)`: cada cambio crea referencias nuevas, y así OnPush, `computed` y `mat-table` se enteran.
5. **Los métodos de escritura devuelven Observable.** El componente decide qué hacer al terminar (navegar, mostrar el error junto al campo).

## 3. Pesimista u optimista

| Estrategia | Cómo | Cuándo |
|---|---|---|
| Pesimista | Cambias el estado **después** de que el backend confirma | Casi siempre en un ERP: el backend puede rechazar (409, permisos) |
| Optimista | Cambias el estado **antes** y lo reviertes si falla | Acciones baratas y casi siempre exitosas (marcar favorito) |

dojo-app es pesimista: `tap` después de la respuesta.

## 4. ¿Y NgRx?

| Opción | Cuándo |
|---|---|
| Servicio con signals (lo de aquí) | La mayoría de las features |
| NgRx Signal Store | Muchas features con el mismo patrón (CRUD + filtros + paginación): reduce código repetido |
| NgRx Store (Redux) | Estado global complejo, muchos equipos, necesidad de DevTools y trazabilidad de acciones |

No agregues una librería de estado para resolver un problema que no tienes. Agregarla después a una feature bien encapsulada es fácil; quitarla, no.

## 5. Por qué inmutable, en la práctica

```ts
// ❌ el arreglo es el mismo: computed no se recalcula y la tabla no se repinta
this._almacenes().find((a) => a.id === id)!.activo = false;

// ✅
this._almacenes.update((lista) => lista.map((a) => (a.id === id ? { ...a, activo: false } : a)));
```

## Lo vas a encontrar así

```ts
private almacenesSubject = new BehaviorSubject<Almacen[]>([]);
almacenes$ = this.almacenesSubject.asObservable();
agregar(a: Almacen) { this.almacenesSubject.next([...this.almacenesSubject.getValue(), a]); }
// plantilla: *ngFor="let a of almacenes$ | async"
```

Es el mismo patrón con RxJS. Funciona, pero cada lectura necesita `async` o `subscribe`, y los derivados son `combineLatest` + `map`. También vas a ver estado en `localStorage` como caché "para no volver a pedir", servicios con `public` arreglos que cualquiera muta y componentes que piden lo mismo al backend cada uno por su lado.

## En un proyecto real

Las pantallas de un ERP comparten catálogos (almacenes, formas de pago, unidades). Si cada pantalla los pide, el backend recibe la misma consulta decenas de veces por sesión. Un store por catálogo con `shareReplay` o un signal cargado una vez resuelve eso; el reto está en saber **cuándo invalidarlo** (al crear o editar uno).

## Ejercicios — `practica/dojo-app`

1. Explica en tu bitácora por qué `AlmacenesStore.filtrados` no es un `signal` que se actualiza a mano.
2. Haz que el filtro de texto de la lista sobreviva al recargar la página guardándolo en un query param (`?q=`). Pista: `Router.navigate([], { queryParams, queryParamsHandling: 'merge' })` y un input `q`.
3. Agrega a `AlmacenesStore` un `computed` `porInicial` que agrupe por la primera letra del nombre (reusa la idea de la kata `agruparPor`).

## Reto B — Desactivar almacenes

Es la contraparte del Reto B del dojo de backend (`PUT /almacenes/:id/desactivar`: 200, 404 si no existe, 409 si ya estaba inactivo). Lo construyes de punta a punta en el front:

- servicio,
- store (inmutable),
- mock (mismas reglas que el backend),
- botón por fila con permiso y confirmación.

```bash
cd practica/dojo-app
npm run reto:b
```

El encabezado del spec [`almacenes.reto-b.spec.ts`](../practica/dojo-app/src/app/features/almacenes/almacenes.reto-b.spec.ts) describe el contrato (nombres de métodos, `aria-label`, texto del botón). El **cómo** es tuyo. Usa `ConfirmarDialogComponent` y la función `confirmar()` que ya existen.

Si hiciste el dojo de backend, pruébalo también contra el dojo-api con tu Reto B resuelto: debe comportarse igual que con el mock.

## Autoevaluación

1. ¿Dónde guardarías la página actual de una tabla y por qué?
2. ¿Por qué el store expone `almacenes` con `asReadonly()`?
3. ¿Qué es actualización pesimista y por qué es el default en un ERP?
4. ¿Por qué mutar un objeto de la lista puede dejar la tabla sin actualizar?
5. ¿Cuándo justificarías NgRx Signal Store?

**Listo cuando:** el reto B pasa, `npm test` sigue en verde y la app desactiva igual con mock y con backend.

Siguiente: [10 · Angular Material, estilos y accesibilidad](10-material-estilos-y-a11y.md)
