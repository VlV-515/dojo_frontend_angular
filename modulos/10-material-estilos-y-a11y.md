# 10 · Angular Material, estilos y accesibilidad

> Cinturón café · 2–3 días

## Objetivos

- Usar los componentes de Angular Material 21 que más aparecen en un ERP: tabla, paginador, form field, select, diálogo, snackbar, tarjetas.
- Tematizar con Material 3 y variables CSS `--mat-sys-*`.
- Organizar estilos: globales, por componente y responsivos.
- Hacer pantallas accesibles (teclado, lectores de pantalla, contraste).
- Mostrar fechas, números y moneda en formato mexicano y traducir textos de librerías.

## 1. Material en dojo-app

| Necesidad | Componente | Dónde verlo |
|---|---|---|
| Tabla | `mat-table` + `*matNoDataRow` | Lista de almacenes |
| Paginación | `mat-paginator` | Lista de almacenes |
| Campos | `mat-form-field` + `matInput` / `mat-select` + `mat-error` | Formulario y filtros |
| Confirmación | `MatDialog` | [`confirmar-dialog.component.ts`](../practica/dojo-app/src/app/shared/components/confirmar-dialog/confirmar-dialog.component.ts) |
| Avisos | `MatSnackBar` | [`notificacion.service.ts`](../practica/dojo-app/src/app/core/ui/notificacion.service.ts) |
| Carga | `mat-progress-bar` | Shell (`app.component.html`) |

Importa **solo** los módulos que la plantilla usa (`MatTableModule`, `MatPaginatorModule`…), en cada componente.

## 2. Tabla: cliente o servidor

dojo-app pagina y filtra **en el cliente**: el dojo-api devuelve todo. `pagina` es un `computed` que corta `filtrados()`. Con miles de registros eso no escala; la paginación va en el servidor:

```ts
// servidor: el componente solo manda parámetros
readonly pagina = signal({ indice: 0, tamano: 25 });
readonly resultado = toSignal(toObservable(this.pagina).pipe(
  switchMap(({ indice, tamano }) => this.service.buscar({ pagina: indice + 1, tamano, texto: this.texto() })),
));
// <mat-paginator [length]="resultado()?.total" … />
```

Cuando cambia un filtro, **regresa a la página 1**: si no, el usuario queda en la página 7 de un resultado que solo tiene 2.

`MatTableDataSource` + `MatSort` + `MatPaginator` es la otra forma (la verás mucho en código legado); con signals es más simple controlar todo a mano.

## 3. Tema y estilos

[`styles.scss`](../practica/dojo-app/src/styles.scss) define el tema una vez con `mat.theme(...)`. Los componentes de Material y **tus** estilos leen variables CSS:

```scss
.estatus { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
```

Nunca colores fijos (`#1976d2`) regados por componentes: cambiar la marca o agregar modo oscuro se vuelve imposible. `color-scheme: light dark` ya hace que el tema siga la preferencia del sistema.

| Estilos | Dónde |
|---|---|
| Tema, reset, utilidades globales | `styles.scss` |
| Lo de un componente | Su `.scss` (encapsulado: no se fuga) |
| Personalizar Material | Variables (`--mat-snack-bar-container-color`), no `::ng-deep` |

Layout con CSS grid y flex; `@media` para pantallas chicas (ver los filtros de la lista). El presupuesto `anyComponentStyle` de `angular.json` falla el build si un `.scss` de componente crece de más.

## 4. Accesibilidad (a11y)

| Regla | Ejemplo en dojo-app |
|---|---|
| Todo control tiene nombre accesible | `<mat-label>`, `aria-label="Editar ALM-01"` en botones repetidos |
| Mensajes dinámicos se anuncian | `role="alert"` en errores, `role="status"` en salud |
| Semántica correcta | `<button>` para acciones, `<a routerLink>` para navegar |
| Se usa con teclado | Material ya maneja foco en diálogos y selects; no rompas el orden con `tabindex` positivos |
| Contraste suficiente | Colores del tema, no grises inventados |

El lint de dojo-app incluye las reglas de accesibilidad de plantillas de angular-eslint. Y los tests con Testing Library buscan por **rol y nombre** (`getByRole('button', { name: 'Guardar' })`): si un test no puede encontrar tu botón así, un lector de pantalla tampoco.

## 5. Formato mexicano e i18n

```ts
registerLocaleData(localeEsMx);
{ provide: LOCALE_ID, useValue: 'es-MX' }
```

```html
{{ total | currency: 'MXN' }}    →  $1,234.50
{{ fecha | date: 'mediumDate' }} →  1 nov 2026
{{ 1234.5 | number: '1.2-2' }}   →  1,234.50
```

Material trae textos en inglés. Se traducen sobrescribiendo sus servicios, como [`paginador-es.ts`](../practica/dojo-app/src/app/core/ui/paginador-es.ts) con `MatPaginatorIntl`. Para fechas en `mat-datepicker` se configura `MAT_DATE_LOCALE` y un adaptador de fechas.

**¿i18n completo?** Si la app es solo en español (lo normal en un ERP local), los textos van directo en las plantillas. Si necesitas varios idiomas, `@angular/localize` (`i18n` en plantillas, un build por idioma) o una librería de traducción en tiempo de ejecución. Decídelo pronto: agregar i18n a 800 plantillas después es un proyecto aparte.

## Lo vas a encontrar así

- Bootstrap (incluso la versión 3) conviviendo con Material: rejilla `col-md-6` y utilidades de Bootstrap en plantillas de Material. Al tocar una pantalla, usa grid/flex y no agregues más clases de Bootstrap.
- `::ng-deep` para "atinarle" a estilos internos de Material. Se rompe en cada actualización de Material.
- `moment` para fechas: está en modo mantenimiento. Para formato, el pipe `date` e `Intl`; para cálculos, `date-fns` o la API `Temporal` cuando esté disponible.
- `mat-table` con `MatTableDataSource` y `filterPredicate` sobrescrito.

## En un proyecto real

Un ERP suele tener su propia capa sobre Material: inputs, selects, tablas y modales de la casa, con una página de catálogo que muestra cómo se usan. Antes de usar Material "crudo" en una pantalla nueva, revisa si ya existe el componente del sistema de diseño. La consistencia (mismos textos, mismos colores, mismos atajos) vale más que la creatividad de cada pantalla.

## Ejercicios — `practica/dojo-app`

1. Agrega una columna "Clave corta" con un pipe que tome los últimos dos caracteres. ¿La tabla sigue siendo accesible?
2. Agrega `MatSortModule` a la tabla y ordena por nombre con signals (sin `MatTableDataSource`).
3. Pon la app en modo oscuro desde tu sistema operativo. ¿Hay algún color que no cambie? Arréglalo con variables.
4. Cambia el idioma del paginador a inglés solo para probar y regrésalo. ¿Por qué no se edita el HTML del paginador?
5. Navega toda la lista y el formulario **solo con teclado**. Anota lo que se pueda mejorar.

## Autoevaluación

1. ¿Cuándo paginas en el cliente y cuándo en el servidor?
2. ¿Por qué variables `--mat-sys-*` y no colores fijos?
3. ¿Por qué evitar `::ng-deep`?
4. ¿Qué tiene que ver `getByRole` con la accesibilidad?
5. ¿Cómo traduces los textos internos de un componente de Material?

**Listo cuando:** tu ordenamiento funciona, el lint sigue limpio y navegas la app con teclado.

Siguiente: [11 · Testing](11-testing.md)
