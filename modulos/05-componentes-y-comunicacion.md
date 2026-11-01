# 05 · Componentes y comunicación

> Cinturón naranja · 2–3 días

## Objetivos

- Pasar datos entre componentes con `input()`, `output()` y `model()`.
- Usar signals (`signal`, `computed`, `effect`) dentro de componentes.
- Proyectar contenido con `<ng-content>`.
- Crear una directiva estructural y un pipe.
- Separar componentes "de pantalla" y componentes "de presentación".

## 1. Entradas y salidas

```ts
export class PageHeaderComponent {
  readonly titulo = input.required<string>();     // obligatorio
  readonly subtitulo = input<string>();           // opcional: string | undefined
}
```

```html
<app-page-header titulo="Almacenes" [subtitulo]="total() + ' activos'" />
```

```ts
export class FilaAlmacenComponent {
  readonly almacen = input.required<Almacen>();
  readonly editar = output<number>();              // emite el id
  // en la plantilla: (click)="editar.emit(almacen().id)"
}
// el padre: <app-fila-almacen [almacen]="a" (editar)="abrir($event)" />
```

`model()` es un input que el hijo también puede escribir (two-way binding `[(valor)]`), útil para controles propios.

**Por qué funciones y no decoradores:** los inputs son signals, así que se combinan con `computed` sin `ngOnChanges`:

```ts
readonly etiqueta = computed(() => `${this.almacen().clave} · ${this.almacen().nombre}`);
```

## 2. Signals en el componente

| API | Para qué |
|---|---|
| `signal(valor)` | Estado local que cambia (`guardando`, `indice`) |
| `computed(() => …)` | Valor derivado, se recalcula solo si cambian sus dependencias |
| `effect(() => …)` | Efecto lateral cuando cambian signals (sincronizar con algo externo) |
| `linkedSignal` | Signal escribible que se reinicia cuando cambia otro |

La paginación de [`almacenes-lista.component.ts`](../practica/dojo-app/src/app/features/almacenes/pages/almacenes-lista/almacenes-lista.component.ts) es un buen ejemplo: `indice` y `tamano` son signals, `pagina` es un `computed` que corta la lista filtrada.

**Usa `effect` poco.** Si puedes expresarlo como `computed`, hazlo. Un `effect` que escribe otros signals es la receta para ciclos y renders de más.

## 3. Proyección de contenido

`PageHeaderComponent` deja un hueco para que cada pantalla ponga sus botones:

```html
<!-- page-header -->
<div class="acciones"><ng-content /></div>

<!-- uso -->
<app-page-header titulo="Almacenes">
  <a mat-flat-button routerLink="nuevo">Nuevo almacén</a>
</app-page-header>
```

Con `<ng-content select="[acciones]" />` puedes tener varios huecos con nombre.

## 4. Directivas y pipes

- **Directiva estructural** [`si-permiso.directive.ts`](../practica/dojo-app/src/app/shared/directives/si-permiso.directive.ts): `*appSiPermiso="'almacenes.editar'"` crea o destruye el elemento según la sesión. Usa un `effect` porque depende de dos signals (el permiso pedido y la sesión).
- **Pipe puro** [`estatus.pipe.ts`](../practica/dojo-app/src/app/shared/pipes/estatus.pipe.ts): `{{ activo | estatus }}`. Solo se recalcula si cambia la entrada; es más barato que llamar un método en la plantilla, que corre en cada ciclo de detección.

## 5. Pantallas y componentes de presentación

| Pantalla (contenedor) | Presentación |
|---|---|
| Inyecta servicios y stores | Solo `input()` / `output()` |
| Sabe de rutas y HTTP | No sabe de dónde vienen los datos |
| `features/*/pages/` | `shared/components/` o `features/*/components/` |
| Ejemplo: `AlmacenesListaComponent` | Ejemplo: `PageHeaderComponent`, `ConfirmarDialogComponent` |

Los de presentación son fáciles de probar y de reutilizar. Los de pantalla orquestan.

## 6. Ciclo de vida, lo justo

- `ngOnInit`: arrancar cargas que dependen de inputs ya asignados (ej. `store.cargar()`).
- `DestroyRef` / `takeUntilDestroyed`: limpiar suscripciones.
- `ngOnChanges`: casi nunca hace falta con inputs signal; usa `computed`.
- `afterNextRender`: tocar el DOM directamente (medir, enfocar) después de pintar.

## Lo vas a encontrar así

```ts
@Input() titulo!: string;
@Input() set almacen(valor: Almacen) { this._almacen = valor; this.recalcular(); }
@Output() editar = new EventEmitter<number>();
ngOnChanges(changes: SimpleChanges) { if (changes['almacen']) { … } }
```

Funciona y vas a verlo mucho. Al migrar: `ng generate @angular/core:signal-input-migration` y `output-migration`.

También: lógica de negocio en componentes de 1 000 líneas, llamadas a métodos en la plantilla (`{{ calcularTotal() }}`) y `@ViewChild` para leer valores que deberían ser inputs.

## En un proyecto real

Un ERP tiene una librería interna de componentes (inputs, selects, tablas, modales) que todas las pantallas reutilizan. Cuando necesites algo "parecido a lo que ya existe", primero busca en `shared/`. Un PR que crea el tercer diálogo de confirmación distinto suele regresar con "usa el que ya existe".

## Ejercicios — `practica/dojo-app`

1. Crea `shared/components/tarjeta-dato/` con `input.required<string>()` para `etiqueta` y `input<number>()` para `valor`. Úsalo en Inicio para mostrar cuántos almacenes activos hay (lee `AlmacenesStore.totalActivos`).
2. Agrega un `output<void>()` `refrescar` al componente y un botón que lo emita; el padre llama `store.cargar()`.
3. Escribe un pipe `clave` que muestre la clave en mayúsculas y entre corchetes. Pruébalo con un spec (copia la forma de `texto.validators.spec.ts`).
4. Lee `si-permiso.directive.ts` y explica por qué guarda `visible` en vez de llamar `clear()` siempre.

## Autoevaluación

1. ¿Qué ventaja tiene `input()` sobre `@Input()` al calcular valores derivados?
2. ¿Cuándo usarías `effect` y cuándo `computed`?
3. ¿Por qué un pipe puro es más eficiente que un método en la plantilla?
4. ¿Qué diferencia hay entre un componente de pantalla y uno de presentación?

**Listo cuando:** tu `tarjeta-dato` funciona en Inicio y `npm run lint` y `npm test` siguen en verde.

Siguiente: [06 · Routing, lazy loading y guards](06-routing-y-guards.md)
