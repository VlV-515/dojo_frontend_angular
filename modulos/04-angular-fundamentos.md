# 04 · Angular fundamentos

> Cinturón naranja · 2–3 días

## Objetivos

- Entender cómo arranca una app Angular 21: `main.ts`, `bootstrapApplication`, `app.config.ts`.
- Usar el Angular CLI para crear, servir, compilar y generar código.
- Entender la inyección de dependencias (DI) con `inject()`.
- Escribir plantillas con interpolación, bindings y el control flow nuevo (`@if`, `@for`, `@switch`).
- Entender la detección de cambios: zone.js, OnPush y zoneless.

## 1. Cómo arranca la app

```
index.html  →  <app-root>
main.ts     →  bootstrapApplication(App, appConfig)
app.config.ts → providers globales: router, HttpClient, interceptores, locale, ErrorHandler
app.component.ts → shell (barra + <router-outlet>)
```

Abre [`main.ts`](../practica/dojo-app/src/main.ts) y [`app.config.ts`](../practica/dojo-app/src/app/app.config.ts). Todo lo "global" vive en `providers`. No hay `AppModule`: desde Angular 19 todo componente es **standalone** por default.

## 2. El CLI

```bash
cd practica/dojo-app
npm run start:mock                         # ng serve con el mock, http://localhost:4200
npx ng generate component features/demo/hola --dry-run   # mira qué crearía, sin crearlo
npx ng build                               # producción en dist/
npx ng version
```

`angular.json` define los *targets* (`build`, `serve`, `lint`) y sus *configurations* (`production`, `development`, `mock`). Lo verás a fondo en el módulo 12.

## 3. Anatomía de un componente

```ts
@Component({
  selector: 'app-page-header',                 // prefijo del proyecto: evita choques
  imports: [MatButtonModule],                  // lo que la PLANTILLA usa
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',    // estilos encapsulados a este componente
})
export class PageHeaderComponent {
  readonly titulo = input.required<string>();
}
```

Si la plantilla usa algo que no está en `imports`, el compilador falla (con `strictTemplates`). Es el error más común al empezar: "`mat-button` is not a known element".

## 4. Inyección de dependencias

Angular crea y entrega las instancias; tú solo las pides:

```ts
export class AlmacenesStore {
  private readonly service = inject(AlmacenesService);   // estilo moderno
}
```

- `@Injectable({ providedIn: 'root' })`: una sola instancia para toda la app (singleton) y *tree-shakable*: si nadie la usa, no entra al bundle.
- `InjectionToken`: para inyectar valores que no son clases, como la base de la API ([`api-url.ts`](../practica/dojo-app/src/app/core/http/api-url.ts)). En tests se reemplaza con `{ provide: API_URL, useValue: '/api' }`.
- `inject()` solo funciona en *contexto de inyección*: constructor, inicializadores de campos, factories, guards e interceptores funcionales.

**Por qué DI:** en los tests cambias el servicio real por uno falso sin tocar el componente. Mira cómo [`almacenes.store.spec.ts`](../practica/dojo-app/src/app/features/almacenes/state/almacenes.store.spec.ts) reemplaza `AlmacenesService`.

## 5. Plantillas

```html
<h1>{{ titulo() }}</h1>                         <!-- interpolación (signals se llaman con ()) -->
<button [disabled]="guardando()">              <!-- property binding -->
<button (click)="guardar()">                   <!-- event binding -->
<input [formControl]="nombre">                 <!-- forms (módulo 07) -->

@if (error(); as e) { <p role="alert">{{ e }}</p> } @else { … }

@for (perfil of perfiles; track perfil.clave) {
  <mat-option [value]="perfil.clave">{{ perfil.nombre }}</mat-option>
} @empty { <p>Sin perfiles</p> }

@switch (vista().tipo) { @case ('ok') { … } @default { … } }
```

`track` es obligatorio en `@for`: le dice a Angular cómo reconocer cada elemento para no volver a pintar toda la lista. Usa un id estable, nunca el índice si la lista se reordena.

## 6. Detección de cambios

Angular revisa los componentes y actualiza el DOM cuando algo cambia. ¿Cómo sabe que algo cambió?

| Modo | Cómo se entera | Dónde lo verás |
|---|---|---|
| **zone.js** (default histórico) | Parcha `setTimeout`, eventos, `fetch`… y revisa todo el árbol después de cada uno | La mayoría de los proyectos existentes, y dojo-app (`provideZoneChangeDetection`) |
| **OnPush** | Solo revisa el componente si cambió un input (por referencia), hubo un evento en él o cambió un signal que lee | Componentes de dojo-app (el lint lo exige) |
| **Zoneless** | Sin zone.js: solo signals, eventos de plantilla y `markForCheck` disparan revisión | Default en apps nuevas de Angular 21 |

dojo-app usa **zone.js + OnPush en todo**: es la combinación más común hoy en proyectos empresariales y la que hace fácil migrar a zoneless después. La regla que te salva en los tres modos: **estado en signals y datos inmutables**.

El bug clásico al migrar a OnPush: un componente que muta un arreglo o cambia una propiedad común dentro de un `subscribe`, y la pantalla "no se actualiza hasta que pasas el mouse". Solución: signals (o `markForCheck()` en código legado).

## Lo vas a encontrar así

- `NgModule` con `declarations`, `imports`, `exports` y un `SharedModule` gigante que importa todo. Los componentes nuevos se hacen standalone y se van migrando con `ng generate @angular/core:standalone`.
- `constructor(private service: AlmacenesService) {}` en vez de `inject()`. Funcionan igual; `inject()` es más corto y funciona en funciones.
- `*ngIf`, `*ngFor`, `[ngSwitch]`: el control flow viejo. Se migra con `ng generate @angular/core:control-flow`. dojo-app tiene una regla de lint que lo prohíbe.
- `ChangeDetectionStrategy.Default` en todos lados y `ChangeDetectorRef.detectChanges()` para "arreglar" pantallas que no se actualizan.

## En un proyecto real

En un ERP con cientos de componentes, el modo de detección de cambios es una decisión de rendimiento: con zone.js y `Default`, cada tecla en un input revisa todo el árbol. Por eso los equipos adoptan OnPush pantalla por pantalla y, a la larga, zoneless. Cuando migres una pantalla a OnPush, busca todo lo que se modifica de forma asíncrona sin signals: ahí están los bugs.

## Ejercicios — `practica/dojo-app`

1. Levanta la app con `npm run start:mock` y entra con el token `dojo-local-inseguro`.
2. Recorre [`app.config.ts`](../practica/dojo-app/src/app/app.config.ts) y explica cada provider en tu bitácora.
3. Agrega un input `icono` opcional a `PageHeaderComponent` y úsalo en Inicio. Verifica con `npm run build` que compila.
4. Busca el `@for` del login (`login.component.html`). Explica qué pasaría con `track $index` si la lista de perfiles se reordenara.
5. Quita `MatButtonModule` de los `imports` de `ReportesComponent` y lee el error del compilador. Regrésalo.

## Autoevaluación

1. ¿Qué reemplazó a `AppModule` y dónde se registran los providers globales?
2. ¿Qué significa `providedIn: 'root'` y por qué es *tree-shakable*?
3. ¿Para qué sirve `track` en `@for`?
4. Explica con tus palabras zone.js, OnPush y zoneless.
5. Una pantalla OnPush no se actualiza al llegar una respuesta HTTP. Da dos causas posibles.

**Listo cuando:** puedes explicar cómo arranca dojo-app de `index.html` hasta la primera pantalla.

Siguiente: [05 · Componentes y comunicación](05-componentes-y-comunicacion.md)
