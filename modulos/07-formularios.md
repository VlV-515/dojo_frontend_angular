# 07 · Formularios reactivos

> Cinturón verde · 2–3 días

## Objetivos

- Construir formularios reactivos **tipados** con `NonNullableFormBuilder`.
- Usar validadores de Angular y escribir los tuyos.
- Mostrar errores en el momento correcto (tocado, enviado) y con mensajes claros.
- Manejar errores del servidor dentro del formulario (por ejemplo, clave duplicada).
- Proteger al usuario de perder cambios con `canDeactivate`.

## 1. Reactivos y tipados

```ts
private readonly fb = inject(NonNullableFormBuilder);

protected readonly form = this.fb.group({
  clave: ['', [Validators.required, claveValida]],
  nombre: ['', [Validators.required, noSoloEspacios, Validators.minLength(3), Validators.maxLength(80)]],
});

const { clave, nombre } = this.form.getRawValue();   // { clave: string; nombre: string }
```

- `NonNullableFormBuilder`: al hacer `reset()` los campos vuelven a su valor inicial (`''`), no a `null`. Sin él, cada valor es `string | null`.
- `getRawValue()` incluye los campos deshabilitados; `value` no. En edición, la clave está deshabilitada y aun así la necesitas.

Abre [`almacen-form.component.ts`](../practica/dojo-app/src/app/features/almacenes/pages/almacen-form/almacen-form.component.ts) y su plantilla.

## 2. Validadores

| Validador | Ojo con |
|---|---|
| `Validators.required` | Acepta `"   "` como válido |
| `minLength` / `maxLength` | No validan si el campo está vacío (eso es de `required`) |
| `pattern` | Regex completa; mejor un validador propio con nombre claro |
| `email` | Muy permisivo |

Un validador es una función `(control) => ValidationErrors | null` ([`texto.validators.ts`](../practica/dojo-app/src/app/shared/validators/texto.validators.ts)):

```ts
export const noSoloEspacios: ValidatorFn = (control) => {
  const valor = control.value;
  if (typeof valor !== 'string' || valor.length === 0) return null;   // eso lo decide `required`
  return valor.trim().length === 0 ? { soloEspacios: true } : null;
};
```

Regla: cada validador revisa **una** cosa y devuelve un error con nombre claro. Los mensajes se arman en un solo lugar (`mensajeError`) para que todo el sistema diga lo mismo.

Validadores de grupo (`fechaInicio <= fechaFin`) se ponen en el `group`. Validadores asíncronos (¿la clave ya existe?) reciben un Observable; úsalos con `updateOn: 'blur'` para no pegarle al backend en cada tecla.

## 3. Cuándo mostrar errores

```html
<input matInput formControlName="nombre" required />
@if (form.controls.nombre.invalid) {
  <mat-error>{{ mensajeError(form.controls.nombre) }}</mat-error>
}
```

`mat-error` solo se ve cuando el control es inválido **y** fue tocado o el formulario se envió. Al enviar un formulario inválido, `markAllAsTouched()` muestra todos los errores de una vez:

```ts
if (this.form.invalid) { this.form.markAllAsTouched(); return; }
```

No deshabilites el botón "Guardar" mientras el formulario es inválido: el usuario no sabe por qué no puede guardar. Deshabilítalo solo mientras **guarda** (evita doble envío).

## 4. Errores del servidor en el formulario

La validación del front es comodidad; el backend vuelve a validar. Algunas reglas solo las conoce el backend (clave duplicada → 409). Ese error va **junto al campo**, no en un toast:

```ts
error: (err: ErrorApp) => {
  if (err.notificado) return;                                  // 0/403/5xx: ya lo mostró el interceptor
  if (err.status === 409) this.form.controls.clave.setErrors({ servidor: err.message });
  else this.errorGeneral.set(err.message);
}
```

## 5. Cambios sin guardar

[`cambios-sin-guardar.guard.ts`](../practica/dojo-app/src/app/core/guards/cambios-sin-guardar.guard.ts) es un `canDeactivate` que pregunta antes de salir si `form.dirty`. El componente implementa `tieneCambiosSinGuardar()`. Después de guardar se marca como guardado para no preguntar al navegar a la lista.

## 6. Signal Forms

Angular 21 trae **Signal Forms** (`@angular/forms/signals`) como API experimental: el modelo es un signal y los validadores se declaran como esquema. Todavía es experimental: aprende reactivos tipados (lo que vas a encontrar en todos lados) y ten Signal Forms en el radar.

## Lo vas a encontrar así

```ts
form = new UntypedFormGroup({
  clave: new UntypedFormControl('', Validators.required),
});
const datos: any = this.form.value;
```

`UntypedFormGroup` es lo que quedó tras la migración automática a formularios tipados (Angular 14): mismo API, sin tipos. En proyectos grandes es lo más común. Al tocar un formulario legado puedes tiparlo poco a poco; no lo mezcles a medias en el mismo formulario.

También verás formularios *template-driven* (`[(ngModel)]`): útiles para cosas muy simples, difíciles de probar y de validar en conjunto.

## En un proyecto real

Las altas de un ERP tienen 10–30 campos, selects que dependen de otros (país → estado → municipio), montos con máscara de moneda y fechas en formato mexicano. El patrón no cambia: formulario reactivo, validadores con nombre, mensajes centralizados, errores del servidor junto al campo y un guard de cambios sin guardar.

## Ejercicios — `practica/dojo-app`

1. Intenta guardar el formulario vacío, con clave `ALM 01` y con clave `ALM-01` (duplicada en el mock). ¿Dónde aparece cada error?
2. Agrega a `mensajeError` un caso para `Validators.pattern` y úsalo en un campo nuevo `telefono` (10 dígitos) **solo en un formulario de prueba**, no en almacenes.
3. Escribe un validador de grupo `distintos('clave', 'nombre')` que falle si clave y nombre son iguales. Agrégale spec.
4. Cambia `nombre` a `updateOn: 'blur'` y observa qué cambia al teclear.

## Autoevaluación

1. ¿Qué cambia entre `FormBuilder` y `NonNullableFormBuilder`?
2. ¿Por qué `getRawValue()` y no `value` en la edición de almacenes?
3. ¿Por qué no deshabilitar "Guardar" cuando el formulario es inválido?
4. ¿Dónde muestras un 409 de clave duplicada y por qué ahí?
5. ¿Qué diferencia hay entre un validador de control y uno de grupo?

**Listo cuando:** tu validador de grupo tiene spec en verde y puedes explicar el flujo completo de `guardar()`.

Siguiente: [08 · HTTP, interceptores y manejo de errores](08-http-interceptores-y-errores.md)
