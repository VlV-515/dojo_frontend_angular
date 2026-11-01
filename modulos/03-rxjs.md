# 03 · RxJS

> Cinturón amarillo · 3–4 días

## Objetivos

- Entender qué es un `Observable` y cuándo se ejecuta.
- Dominar los operadores del día a día: `map`, `filter`, `tap`, `catchError`, `debounceTime`, `distinctUntilChanged`, `combineLatest`, `startWith`, `retry`, `shareReplay`.
- Elegir bien entre `switchMap`, `mergeMap`, `concatMap` y `exhaustMap`.
- Probar flujos con marble testing.
- Saber cuándo usar RxJS y cuándo signals.

## 1. Observable en una frase

Un `Observable` es una **función perezosa** que puede emitir cero, uno o muchos valores en el tiempo, y luego completar o fallar. Nada pasa hasta que alguien se suscribe.

```ts
const almacenes$ = this.http.get<Respuesta<Almacen[]>>(url);   // todavía no hay petición
almacenes$.subscribe();                                        // ahora sí
almacenes$.subscribe();                                        // ¡otra petición!
```

Por eso un servicio HTTP **devuelve** el Observable y no se suscribe: quien lo usa decide cuándo y cuántas veces ([`almacenes.service.ts`](../practica/dojo-app/src/app/features/almacenes/services/almacenes.service.ts)).

Convención: los Observables terminan en `$`.

## 2. Operadores del día a día

| Operador | Uso típico en Angular |
|---|---|
| `map` | Desenvolver `{ codigo, mensaje, datos }` → `datos` |
| `filter` | Ignorar valores (p. ej. el diálogo se cerró sin confirmar) |
| `tap` | Efectos laterales sin cambiar el valor (actualizar un store, log) |
| `catchError` | Convertir un error en un valor o re-lanzarlo normalizado |
| `finalize` | Apagar un indicador de carga pase lo que pase |
| `debounceTime` + `distinctUntilChanged` | Buscadores: esperar a que el usuario deje de teclear |
| `combineLatest` | Combinar lista + filtros |
| `startWith` | Emitir un estado inicial ("cargando") |
| `retry` | Reintentar peticiones idempotentes |
| `shareReplay` | Cachear un catálogo que no cambia |

## 3. Los cuatro `*Map`: la pregunta de entrevista

Todos convierten cada valor en un Observable interno. Cambia **qué pasa si llega un valor nuevo mientras el anterior sigue en curso**:

| Operador | Qué hace | Úsalo para |
|---|---|---|
| `switchMap` | Cancela el anterior | Buscador, cambiar de almacén seleccionado |
| `concatMap` | Encola, uno tras otro | Guardados que deben respetar el orden |
| `mergeMap` | Todos en paralelo | Cargar detalles independientes |
| `exhaustMap` | Ignora los nuevos hasta terminar | Botón "Guardar" que el usuario presiona 5 veces |

En dojo-app, desactivar un almacén encadena el diálogo de confirmación con la petición: `confirmar(...).pipe(filter(Boolean), switchMap(() => store.desactivar(id)))`. Lo construyes en el Reto B.

## 4. Errores: un Observable que falla, muere

Cuando un Observable emite error, **termina**. Si lo atrapas dentro de un flujo largo (por ejemplo, un `valueChanges`), el flujo entero se muere. Atrapa el error **dentro** del `switchMap`:

```ts
texto$.pipe(
  switchMap((t) => this.buscar(t).pipe(catchError(() => of([])))),   // ✅ el buscador sigue vivo
);
```

Y nunca te lo tragues en silencio (`catchError(() => EMPTY)`) sin avisar a nadie: el usuario se queda con un spinner eterno.

## 5. Suscripciones y fugas

Cada `subscribe` a algo que no completa (`valueChanges`, `interval`, un `Subject`) vive hasta que lo cancelas. Opciones, de mejor a peor:

1. No suscribirte: usa `toSignal()` o el pipe `async` en la plantilla; Angular cancela solo.
2. `takeUntilDestroyed()` (de `@angular/core/rxjs-interop`) en componentes.
3. `take(1)` / `first()` cuando solo te importa un valor (guards, por ejemplo).
4. Guardar la `Subscription` y llamar `unsubscribe()` en `ngOnDestroy` (código legado).

Las peticiones HTTP completan solas: suscribirte a una no fuga memoria, pero sí puede actualizar una pantalla que ya no existe.

## 6. Marble testing

Los specs de `practica/katas/rxjs` usan `TestScheduler`. Cada carácter es 1 ms de tiempo virtual:

```
-   pasa 1 ms          a   emite el valor a       |   completa
#   error              (ab)  a y b en el mismo ms  ^   suscripción
```

```ts
scheduler.run(({ cold, expectObservable }) => {
  const peticion$ = cold('--a|', { a: 7 });
  expectObservable(conEstado(peticion$)).toBe('c-a|', { c: { estado: 'cargando' }, a: { estado: 'listo', datos: 7 } });
});
```

Dentro de `run`, `debounceTime` usa tiempo virtual: el test de un buscador corre en milisegundos.

## 7. ¿RxJS o signals?

| Usa signals para | Usa RxJS para |
|---|---|
| Estado que la plantilla lee (lista, filtros, "cargando") | Eventos en el tiempo (teclas, websockets, polling) |
| Valores derivados (`computed`) | Cancelar, reintentar, combinar asíncronos |
| Inputs de componentes | HTTP (`HttpClient` devuelve Observables) |

El puente: `toSignal(obs$)` y `toObservable(signal)`. dojo-app los combina: HTTP con RxJS, estado con signals.

## Lo vas a encontrar así

- `BehaviorSubject` / `ReplaySubject` como estado en servicios, con `asObservable()` y `getValue()`. Funciona; los signals lo hacen más simple (módulo 09).
- `subscribe` dentro de `subscribe` ("callback hell" reactivo). Se reemplaza por `switchMap`/`concatMap`.
- `.toPromise()` (obsoleto): hoy es `firstValueFrom` / `lastValueFrom`.
- `map((r) => { return r; })` en cada servicio: no hace nada, bórralo.

## En un proyecto real

Un ERP tiene buscadores en casi todas las pantallas (productos, clientes, almacenes). El patrón `debounceTime + distinctUntilChanged + switchMap + catchError` es el que más vas a escribir, y el bug clásico de PR es olvidar el `switchMap`: llegan las respuestas desordenadas y la tabla muestra resultados de lo que el usuario tecleó antes.

## Ejercicios — `practica/katas/rxjs`

```bash
cd practica/katas
npm run test:rxjs
```

Siete katas: `soloActivos`, `buscador`, `conEstado`, `filtrar`, `guardarEnOrden`, `conReintentos`, `cachear`. Lee primero el diagrama de canicas de cada spec y dibújalo en papel.

## Autoevaluación

1. ¿Por qué un servicio HTTP devuelve el Observable en vez de suscribirse?
2. Un buscador muestra resultados viejos cuando tecleas rápido. ¿Qué operador falta?
3. ¿Qué operador usarías para que un botón "Guardar" ignore los clics mientras guarda?
4. ¿Qué le pasa a un `valueChanges.pipe(switchMap(...))` si el Observable interno falla y no lo atrapas?
5. ¿Qué diferencia hay entre `shareReplay({ refCount: true })` y `refCount: false`?

**Listo cuando:** `npm run test:rxjs` pasa en verde y puedes dibujar las canicas de la kata 2.

Siguiente: [04 · Angular fundamentos](04-angular-fundamentos.md)
