# Soluciones (para mentores)

> Si eres alumno: llegar aquí antes de intentar te quita justo lo que viniste a aprender. Usa `/pista` primero.

## Katas

Las soluciones viven junto a los ejercicios, en `solucion.ts`, y solo entran con la configuración de Jest de solución:

```bash
cd practica/katas
npm ci
npm run test:solucion        # todo en verde
```

## Retos de dojo-app

`dojo-app-retos.patch` resuelve los retos A, B y C sobre una copia limpia:

```bash
# desde la raíz del repo dojo_frontend_angular/
mkdir -p /tmp/dojo-sol && rsync -a --exclude node_modules --exclude dist --exclude .angular practica/dojo-app /tmp/dojo-sol/
patch -p1 -d /tmp/dojo-sol < soluciones/dojo-app-retos.patch
cd /tmp/dojo-sol/dojo-app
npm ci
npm run retos && npm test && npm run lint && npm run build
```

Qué contiene:

- **Reto A:** `canMatch: [authGuard, permisoGuard('reportes.ver')]` en la ruta `reportes` de `app.routes.ts`.
- **Reto B:** `AlmacenesService.desactivar` (`PUT /almacenes/:id/desactivar`), `AlmacenesStore.desactivar` (inmutable, pesimista), regla en el mock (404/409), botón por fila con `*appSiPermiso`, confirmación con `confirmar()` y `filter` + `switchMap`.
- **Reto C:** `features/cajas` (modelo, `CajasService`, `CajasListaComponent` con `switchMap` al cambiar de almacén), permisos `cajas.ver`/`cajas.editar`, ruta lazy protegida, `/cajas` en el mock con `MockDb.cajas`, liga en la barra y tarjeta en Inicio.

No es la única solución válida. Al revisar, prioriza la rúbrica del módulo 14 sobre el parecido con el patch.

## Verificación completa del dojo (antes de compartir cambios)

```bash
# Katas: sin solución fallan, con solución pasan
cd practica/katas && npm ci && npm run typecheck && npm run lint && npm run test:solucion
npm test        # debe FALLAR

# dojo-app: base en verde y retos en rojo
cd ../dojo-app && npm ci && npm run lint && npm run format:check && npm test && npm run build
npm run retos   # debe FALLAR
```

Después aplica el patch en una copia y confirma que `npm run retos` pasa y que la base sigue en verde.

## Regenerar el patch

Si cambias un reto o la base que toca el patch:

```bash
# a/ = base limpia, b/ = base + solución (ambas sin node_modules)
diff -ruN -x node_modules -x dist -x .angular a b > soluciones/dojo-app-retos.patch
```

Los specs de los retos deben ser idénticos en `a/` y `b/`: el patch nunca los toca.
