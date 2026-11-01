# 02 · TypeScript

> Cinturón amarillo · 2–3 días

## Objetivos

- Escribir TypeScript con `strict` sin pelearte con el compilador.
- Usar genéricos, uniones discriminadas, narrowing y utility types.
- Entender `unknown` frente a `any` y por qué los datos que llegan de la red no son confiables.
- Escribir código inmutable: es la base de OnPush y signals en Angular.

## 1. Por qué TypeScript estricto

Angular está escrito en TypeScript y su compilador revisa también las plantillas (`strictTemplates`). Con `strict: true` el compilador atrapa en tu editor los errores que, sin él, verías en producción: `undefined is not a function`, propiedades mal escritas, `null` donde no lo esperabas.

```ts
interface Almacen { id: number; clave: string; nombre: string; activo: boolean }

function etiqueta(a: Almacen | undefined): string {
  return a.clave;            // ❌ 'a' is possibly 'undefined'
  return a?.clave ?? '—';    // ✅
}
```

## 2. Tipos que vas a usar todos los días

| Herramienta | Ejemplo | Para qué |
|---|---|---|
| `interface` / `type` | `interface Almacen {…}` | Forma de los datos |
| Unión | `'todos' \| 'activos' \| 'inactivos'` | Valores permitidos, sin strings sueltos |
| Genérico | `Respuesta<T>` | Una envoltura para cualquier dato |
| `Partial<T>` | `actualizar(a, { nombre })` | Cambios parciales |
| `Pick` / `Omit` | `Omit<Almacen, 'id'>` | Derivar tipos en vez de copiarlos |
| `Record<K, V>` | `Record<string, Almacen[]>` | Diccionarios |
| `readonly` | `readonly Permiso[]` | Que nadie mute lo que no debe |

La envoltura del backend, tipada una sola vez, quita el `any` de toda la app ([`respuesta.model.ts`](../practica/dojo-app/src/app/core/modelos/respuesta.model.ts)):

```ts
export interface Respuesta<T> { codigo: number; mensaje: string; datos: T }
this.http.get<Respuesta<Almacen[]>>(url).pipe(map((r) => r.datos));   // Observable<Almacen[]>
```

## 3. Uniones discriminadas y narrowing

Un estado de pantalla es **una** de varias formas. Modelarlo así hace imposibles los estados absurdos (por ejemplo, "cargando" y "con error" al mismo tiempo):

```ts
type EstadoPeticion<T> =
  | { tipo: 'cargando' }
  | { tipo: 'exito'; datos: T }
  | { tipo: 'error'; mensaje: string };

switch (estado.tipo) {
  case 'exito': return estado.datos.length;      // aquí TS sabe que hay `datos`
  case 'error': return estado.mensaje;
  case 'cargando': return 0;
  default: { const nunca: never = estado; return nunca; }  // si agregan un caso, esto no compila
}
```

`SaludComponent` usa este patrón con `@switch` en la plantilla ([`salud.component.ts`](../practica/dojo-app/src/app/features/salud/salud.component.ts)).

## 4. `unknown`, no `any`

`any` apaga el compilador: todo pasa y nada se revisa. `unknown` dice "no sé qué es, demuéstramelo". Lo que llega de la red, de `JSON.parse` o de `sessionStorage` es `unknown` hasta que lo validas con un **type guard**:

```ts
function esAlmacen(x: unknown): x is Almacen {
  return typeof x === 'object' && x !== null && typeof (x as Almacen).id === 'number' /* … */;
}
```

`HttpClient.get<T>()` **no valida** nada: el `<T>` es una promesa que le haces al compilador. Si el backend cambia el contrato, tu app truena en tiempo de ejecución. Por eso los mensajes de error se leen como `unknown` en [`error-app.ts`](../practica/dojo-app/src/app/core/errores/error-app.ts).

## 5. Inmutabilidad

```ts
lista.push(nuevo);                 // ❌ muta: OnPush, computed y track no se enteran
lista = [...lista, nuevo];         // ✅ arreglo nuevo
almacen.activo = false;            // ❌
almacen = { ...almacen, activo: false };  // ✅
```

Angular detecta cambios comparando **referencias**. Si mutas, la referencia es la misma y la pantalla no se actualiza (o se actualiza "a veces", que es peor). Lo vas a ver en el módulo 09.

## 6. async/await

```ts
async function cargar(): Promise<Almacen[]> {
  try {
    const r = await fetch('/api/almacenes');
    return (await r.json()).datos;
  } catch (e) {
    throw new Error('No se pudo cargar', { cause: e });
  }
}
```

En Angular casi todo es `Observable` (módulo 03), pero `async/await` aparece en tests, guards y utilidades.

## Lo vas a encontrar así

- `any` por todos lados, sobre todo en respuestas HTTP (`Observable<any>`) y en `catchError((err: any) => …)`. Al tocar ese código, tipa lo que toques.
- `strict` apagado o `strictTemplates: false`. Encenderlo de golpe en un proyecto grande produce cientos de errores; los equipos lo activan por carpetas o con `// @ts-expect-error` documentado.
- Clases con `public` en todo y constructores con 8 parámetros: herencia de estilos de Java/C#.

## En un proyecto real

Los modelos viven junto a su feature (`features/almacenes/models/`) y los compartidos en `core/modelos`. Cuando el backend agrega un campo, se agrega en **un** lugar y el compilador te dice todo lo que hay que tocar. Por eso un PR que agrega `any` "para que compile" casi siempre regresa con comentarios.

## Ejercicios — `practica/katas/typescript`

```bash
cd practica/katas
npm test -- typescript        # o: npm run test:typescript
```

1. Kata 1 · `normalizarClave`: strings y expresiones regulares.
2. Kata 2 · `agruparPor` y `paginar`: genéricos.
3. Kata 3 · `actualizar`: inmutabilidad con `Partial<T>`.
4. Kata 4 · `describirEstado`: unión discriminada + chequeo exhaustivo con `never`.
5. Kata 5 · `esAlmacen` y `leerAlmacenes`: `unknown` y type guards.
6. Kata 6 · `conReintentos`: async/await y errores.

Corre también `npm run typecheck` y `npm run lint`: los dos deben quedar limpios. `solucion.ts` es la referencia del sensei: solo entra con `npm run test:solucion`. Intenta primero.

## Autoevaluación

1. ¿Qué diferencia práctica hay entre `any` y `unknown`?
2. ¿Por qué `http.get<Almacen[]>()` no garantiza que te llegue un arreglo de almacenes?
3. ¿Qué ganas al modelar el estado de una pantalla como unión discriminada?
4. ¿Por qué `lista.push(x)` puede hacer que una pantalla OnPush no se actualice?
5. ¿Para qué sirve asignar a `never` en el `default` de un `switch`?

**Listo cuando:** `npm run test:typescript` pasa en verde y puedes explicar la kata 5.

Siguiente: [03 · RxJS](03-rxjs.md)
