# 06 · Routing, lazy loading y guards

> Cinturón verde · 2–3 días

## Objetivos

- Definir rutas, rutas hijas, parámetros y títulos.
- Cargar features bajo demanda con `loadComponent` y `loadChildren`.
- Proteger rutas con guards funcionales: `canMatch`, `canActivate`, `canDeactivate`.
- Entender por qué un guard es experiencia de usuario y la seguridad real vive en el backend.
- Elegir entre `HashLocationStrategy` y `PathLocationStrategy`.

## 1. Rutas

[`app.routes.ts`](../practica/dojo-app/src/app/app.routes.ts):

```ts
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'almacenes',
    canMatch: [authGuard, permisoGuard('almacenes.ver')],
    loadChildren: () => import('./features/almacenes/almacenes.routes').then((m) => m.ALMACENES_ROUTES),
  },
  { path: '**', loadComponent: () => import('./features/no-encontrada/no-encontrada.component').then(…) },
];
```

- El orden importa: el router usa la **primera** ruta que hace match. `**` va al final.
- `title` cambia el título de la pestaña.
- `:id` es un parámetro. Con `withComponentInputBinding()` llega directo como `input()` del componente (`AlmacenFormComponent.id`).

## 2. Lazy loading: por qué siempre

Con `component:` el código de esa pantalla viaja en el bundle inicial aunque el usuario nunca la abra. Con `loadComponent` / `loadChildren` se descarga al navegar. En un ERP con 30 módulos la diferencia es entre segundos y décimas en la primera carga.

Corre `npm run build` y mira la sección **Lazy chunk files**: cada pantalla es su propio archivo. [`app.routes.spec.ts`](../practica/dojo-app/src/app/app.routes.spec.ts) falla si alguien agrega una ruta eager.

## 3. Guards funcionales

| Guard | Cuándo corre | Para qué |
|---|---|---|
| `canMatch` | Antes de elegir la ruta | Sesión y permisos. Si falla, **el chunk lazy no se descarga** |
| `canActivate` | Ya elegida, antes de activar | Validaciones que necesitan la ruta resuelta |
| `canDeactivate` | Al salir | "Tienes cambios sin guardar" |
| `resolve` | Antes de activar | Precargar datos (úsalo poco: bloquea la navegación) |

Un guard devuelve `true`, `false`, un `UrlTree` (redirección) o un Observable/Promise de esos.

```ts
// core/auth/auth.guard.ts
export const authGuard: CanMatchFn = (_route, segmentos) => {
  if (inject(SesionService).autenticado()) return true;
  const volver = '/' + segmentos.map((s) => s.path).join('/');
  return inject(Router).createUrlTree(['/login'], { queryParams: { volver } });
};

// core/auth/permiso.guard.ts: fábrica de guards
export function permisoGuard(permiso: Permiso): CanMatchFn { … }
```

Regresa un `UrlTree` en vez de llamar `router.navigate()` dentro del guard: el router cancela la navegación actual limpiamente y no hay dos navegaciones compitiendo.

Si un guard usa un Observable que no completa (por ejemplo, el estado de sesión como `BehaviorSubject`), agrega `take(1)`. Con `canMatch`, que corre en **cada** navegación, una suscripción sin cerrar se acumula.

## 4. Guards no son seguridad

Todo el JavaScript de la app está en el navegador del usuario: puede leerlo, modificarlo o saltarse el guard. Los guards sirven para **no llevar al usuario a una pantalla que va a fallar**. La seguridad real es que el backend responda 401/403 a cada petición sin permiso. Un front bien hecho tiene las dos cosas.

## 5. Hash o path

| | `/#/almacenes` (hash) | `/almacenes` (path) |
|---|---|---|
| Servidor | Cualquier hosting estático, sin configuración | Necesita reescribir toda ruta desconocida a `index.html` |
| URLs | Feas, pero estables | Limpias, buenas para SEO |
| Se activa | `withHashLocation()` | Default |

Muchos sistemas internos usan hash porque se despliegan en servidores donde el equipo de front no controla las reglas de reescritura. dojo-app usa hash por la misma razón. En una app pública con SEO, path.

## Lo vas a encontrar así

```ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad {
  canActivate(route, state): Observable<boolean> { … }
  canLoad(route): boolean { … }          // obsoleto: hoy es canMatch
}
// rutas
{ path: 'almacenes', loadChildren: () => import('./almacenes/almacenes.module').then(m => m.AlmacenesModule), canLoad: [AuthGuard] }
```

Guards de clase, `canLoad` (reemplazado por `canMatch`) y `NgModule` con `RouterModule.forChild(routes)`. Cuidado con un detalle: si un `NgModule` con `forChild` se importa en otro, sus rutas se **inyectan** en el módulo padre y aparecen rutas fantasma.

## En un proyecto real

En un ERP cada pantalla tiene un permiso y el backend manda al iniciar sesión la lista de módulos y pantallas a las que el usuario tiene acceso. El guard de permiso consulta esa lista; el menú lateral se arma con la misma. Cuando agregas una pantalla nueva, **registrar su permiso** es parte del ticket: si lo olvidas, nadie la ve, o peor, todos la ven.

## Ejercicios — `practica/dojo-app`

1. Sin sesión, entra a `/#/almacenes`. ¿A qué URL te manda y por qué trae `?volver=`?
2. Entra con el perfil "Solo consulta" e intenta `/#/almacenes/nuevo`. ¿Qué guard te detuvo?
3. Abre las DevTools → Network y navega de Inicio a Almacenes. Identifica el chunk lazy que se descarga.
4. Lee `destinoSeguro()` en [`login.component.ts`](../practica/dojo-app/src/app/features/login/login.component.ts). ¿Qué ataque evita?
5. Captura algo en "Nuevo almacén" y navega a Inicio. ¿Qué guard te pregunta y en qué archivo está?

## Reto A — Cazador de rutas sin guard

Alguien registró una ruta privada **sin guards**: cualquiera que teclee la URL entra, con o sin sesión.

```bash
cd practica/dojo-app
npm run reto:a
```

Antes de leer el spec, intenta encontrarla: cierra sesión y prueba las URLs del menú. Después corrígela usando los guards que ya existen. Cuando pase, explica en tu PR (imaginario) por qué el bug pasó la revisión y qué test lo habría atrapado antes.

## Autoevaluación

1. ¿Qué diferencia hay entre `canMatch` y `canActivate` en una ruta lazy?
2. ¿Por qué un guard devuelve un `UrlTree` en vez de navegar?
3. ¿Por qué ocultar un botón o proteger una ruta no es seguridad?
4. ¿Qué pasa si `**` no es la última ruta?
5. ¿Cuándo elegirías hash y cuándo path?

**Listo cuando:** el reto A pasa y `npm test` sigue en verde.

Siguiente: [07 · Formularios reactivos](07-formularios.md)
