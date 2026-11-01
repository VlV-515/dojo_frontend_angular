# 11 · Testing

> Cinturón café · 3 días

## Objetivos

- Correr y escribir tests unitarios con **Jest** + `jest-preset-angular`.
- Probar servicios HTTP con `HttpTestingController`, stores con dobles y guards con `runInInjectionContext`.
- Probar componentes como los usa una persona, con **Testing Library**.
- Saber qué probar (y qué no) y leer la cobertura con criterio.
- Conocer las pruebas E2E con **Playwright**.

## 1. El setup

| Archivo | Para qué |
|---|---|
| [`jest.config.js`](../practica/dojo-app/jest.config.js) | Preset de Angular, alias `@core/*`, ignora los specs de retos |
| [`jest.retos.config.js`](../practica/dojo-app/jest.retos.config.js) | Solo `*.reto-X.spec.ts` |
| [`setup-jest.ts`](../practica/dojo-app/setup-jest.ts) | Entorno de pruebas con zone.js + matchers de jest-dom |
| [`src/testing/proveedores.ts`](../practica/dojo-app/src/testing/proveedores.ts) | Helpers: API con mock, sesión iniciada |

```bash
npm test                         # todo
npx jest almacenes               # por nombre de archivo
npx jest -t "filtra por texto"   # por nombre de test
npm run test:coverage
```

Angular 21 trae Vitest como runner default en proyectos nuevos. Muchos proyectos existentes usan Jest (o Karma, ya obsoleto); la forma de escribir tests es casi idéntica.

## 2. Qué probar en cada pieza

| Pieza | Cómo | Ejemplo |
|---|---|---|
| Función pura / validador | Directo, tabla de casos (`it.each`) | [`texto.validators.spec.ts`](../practica/dojo-app/src/app/shared/validators/texto.validators.spec.ts) |
| Servicio HTTP | `provideHttpClientTesting` + `HttpTestingController` | [`almacenes.service.spec.ts`](../practica/dojo-app/src/app/features/almacenes/services/almacenes.service.spec.ts) |
| Interceptor | Igual, con `withInterceptors([...])` | [`interceptores.spec.ts`](../practica/dojo-app/src/app/core/http/interceptores.spec.ts) |
| Store | Servicio falso con `jest.fn()` | [`almacenes.store.spec.ts`](../practica/dojo-app/src/app/features/almacenes/state/almacenes.store.spec.ts) |
| Guard | `TestBed.runInInjectionContext(() => guard(...))` | [`guards.spec.ts`](../practica/dojo-app/src/app/core/auth/guards.spec.ts) |
| Componente | Testing Library + mock interceptor | [`almacenes-lista.component.spec.ts`](../practica/dojo-app/src/app/features/almacenes/pages/almacenes-lista/almacenes-lista.component.spec.ts) |
| Rutas | Inspeccionar el arreglo o `RouterTestingHarness` | [`app.routes.spec.ts`](../practica/dojo-app/src/app/app.routes.spec.ts), Reto A |

### HttpTestingController

```ts
service.listar(true).subscribe((l) => (recibido = l));
backend.expectOne('/api/almacenes?activos=true').flush({ codigo: 200, mensaje: 'ok', datos: [] });
afterEach(() => backend.verify());   // falla si quedó una petición sin responder
```

### Testing Library: prueba lo que ve el usuario

```ts
await render(AlmacenesListaComponent, { providers: [...proveerApiMock()] });
await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar por clave o nombre' }), 'bodega');
expect(screen.getByText('1 – 2 de 2')).toBeInTheDocument();
```

- Busca por **rol y nombre** (`getByRole`), luego por texto. Evita selectores CSS y `fixture.debugElement.query(By.css('.btn-x'))`: se rompen al cambiar estilos.
- `getBy…` falla si no está; `queryBy…` devuelve `null` (para afirmar que algo **no** está); `findBy…` espera (asíncrono).
- `userEvent` simula teclas y clics reales; `fireEvent` solo dispara el evento.

## 3. Dobles: mock, stub, fake

| Doble | Qué es | En dojo-app |
|---|---|---|
| Stub | Devuelve respuestas fijas | `{ provide: NotificacionService, useValue: { error: jest.fn() } }` |
| Mock | Además verifica cómo lo llamaron | `expect(notificacion.error).toHaveBeenCalledTimes(1)` |
| Fake | Implementación funcional simplificada | `mockInterceptor` + `MockDb` |

Con un fake del backend los tests de componente prueban la integración real (servicio + store + interceptores) sin red.

## 4. Qué NO probar

- Que Angular funciona (`expect(component).toBeTruthy()` solo, sin nada más).
- Detalles internos (`component['metodoPrivado']`): si refactorizas sin cambiar el comportamiento, el test no debería romperse.
- Material por dentro. Prueba **tu** lógica.

La cobertura dice qué líneas corrieron, no si los asserts sirven. Un 90 % con asserts vacíos vale menos que un 60 % que prueba los casos de error.

## 5. E2E con Playwright

[`e2e/almacenes.e2e.spec.ts`](../practica/dojo-app/e2e/almacenes.e2e.spec.ts) levanta la app en modo mock y recorre login → filtro → alta en un navegador real:

```bash
npx playwright install chromium   # una vez
npm run e2e
```

Los E2E son lentos y frágiles: pocos, de los flujos que más importan. La base de la pirámide son unitarios y de componente.

## Lo vas a encontrar así

- `TestBed.configureTestingModule({ declarations: [...], imports: [SharedModule, HttpClientTestingModule] })` con medio sistema importado para probar un componente.
- `fixture.detectChanges()` en cada paso, `fakeAsync` + `tick()` por todos lados, `spyOn(...).and.returnValue(...)` (sintaxis de Jasmine).
- Archivos `*.spec.ts` generados por el CLI con un solo `should create` y nunca tocados.
- Specs que fallan y están excluidos en la configuración de Jest "temporalmente".

## En un proyecto real

El CI corre los tests en cada PR; si fallan, no se integra. Un test que falla "a veces" (flaky) es peor que no tener test: el equipo aprende a ignorar el rojo. Cuando arregles un bug, **primero** escribe el test que lo reproduce (rojo) y luego el arreglo (verde): así el bug no regresa.

## Ejercicios — `practica/dojo-app`

1. Corre `npm run test:coverage` y abre `coverage/lcov-report/index.html`. ¿Qué archivo de `core/` tiene menos cobertura? Escribe el test que falta.
2. Escribe un spec para `SiPermisoDirective` con un componente host de prueba y los dos perfiles.
3. Escribe un spec para `cambiosSinGuardarGuard`: sin cambios devuelve `true`; con cambios abre el diálogo (usa un doble de `MatDialog`).
4. (Opcional) Instala Chromium para Playwright y corre `npm run e2e`.

## Autoevaluación

1. ¿Para qué sirve `backend.verify()`?
2. ¿Por qué buscar por rol y nombre en vez de por clase CSS?
3. ¿Diferencia entre `getBy`, `queryBy` y `findBy`?
4. ¿Qué es un fake y por qué el `mockInterceptor` es uno?
5. ¿Por qué una cobertura alta no garantiza buenos tests?

**Listo cuando:** tus specs de la directiva y del guard pasan y `npm test` sigue en verde.

Siguiente: [12 · Build, environments, lint y CI](12-build-environments-y-ci.md)
