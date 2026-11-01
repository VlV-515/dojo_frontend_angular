# 14 · Proyecto final

> Cinturón negro · 3–5 días

## Objetivos

- Entregar una feature completa de punta a punta, como un ticket real: modelo, servicio, estado, mock, pantalla, ruta, permisos, tests y documentación.
- Defender tus decisiones en una revisión de código.
- Conectar front y back: si hiciste el dojo de backend, tu Reto C del back y el del front deben funcionar juntos.

## Reto C — Cajas de punta a punta

El backend expone (Reto C del dojo de backend):

| Método | Ruta | Cuerpo / query | Respuestas |
|---|---|---|---|
| `GET` | `/cajas` | `?almacen_id=N` | 200 con `[{ id, nombre, almacen_id, abierta }]`; 400 si falta `almacen_id` |
| `POST` | `/cajas` | `{ nombre, almacen_id }` | 201; 400 si faltan datos; 404 si el almacén no existe |

Construye en dojo-app la pantalla **Cajas**: eliges un almacén activo, ves sus cajas y, con permiso, agregas nuevas.

```bash
cd practica/dojo-app
npm run reto:c
```

El encabezado de [`cajas.reto-c.spec.ts`](../practica/dojo-app/src/app/features/cajas/cajas.reto-c.spec.ts) fija el contrato mínimo (nombres de archivos, clases, métodos, permisos y textos accesibles). Todo lo demás lo decides tú.

### Lista de entrega

- [ ] `features/cajas/` con `models/`, `services/`, `pages/` (y `state/` si lo justificas).
- [ ] Permisos `cajas.ver` y `cajas.editar` en los perfiles.
- [ ] Ruta lazy `cajas` con `authGuard` + `permisoGuard('cajas.ver')`.
- [ ] Mock de `/cajas` con las mismas reglas que el backend (incluye `MockDb.cajas` y `reiniciar()`).
- [ ] Liga en la barra y tarjeta en Inicio, visibles solo con `cajas.ver`.
- [ ] Selector de almacén con solo almacenes activos; tabla con estado vacío; formulario con validación.
- [ ] `npm run reto:c` en verde **y** `npm test`, `npm run lint`, `npm run format:check` y `npm run build` en verde.
- [ ] Al menos **dos extensiones** propias (abajo) con sus tests.

### Extensiones (elige dos o más)

1. La URL recuerda el almacén elegido (`/cajas?almacen=2`): se puede compartir y sobrevive a recargar.
2. Store de cajas con signals y caché por almacén (no vuelve a pedir un almacén ya consultado; se invalida al agregar).
3. Si vienes de la lista de almacenes, una acción "Ver cajas" por fila que abre la pantalla con ese almacén elegido.
4. Manejo del 404 al agregar (el almacén se desactivó o borró mientras tanto): mensaje claro y la lista de almacenes se recarga.
5. E2E con Playwright del flujo completo en modo mock.
6. Contra el dojo-api real con tu Reto C de backend: documenta en el PR cómo lo probaste.

## Rúbrica de revisión

Así revisaría tu PR alguien de un equipo de front profesional. Cada punto es sí/no.

| Área | Se revisa |
|---|---|
| Arquitectura | Carpeta por feature; nada de la feature en `core/`; `shared/` solo para lo reutilizable |
| Componentes | Standalone, `OnPush`, `input()`/`output()`, control flow nuevo, sin lógica de negocio en la plantilla |
| Estado | Una fuente de verdad, inmutable, derivados con `computed`, sin suscripciones colgando |
| HTTP | Servicio tipado que desenvuelve `datos`; `HttpParams`; sin `any`; sin toasts en el servicio |
| Errores | 400/404 junto al formulario; nada tragado; el usuario nunca se queda con un spinner eterno |
| Rutas y permisos | Lazy, `canMatch` con auth y permiso, botones con `*appSiPermiso` |
| Formularios | Tipados, validadores con nombre, `markAllAsTouched` al enviar, sin doble envío |
| UI y a11y | Material del sistema, variables del tema, nombres accesibles, funciona con teclado |
| Tests | Servicio con `HttpTestingController`, pantalla con Testing Library por rol, casos de error |
| Mock | Mismo contrato que el backend |
| Calidad | Lint, formato, build y tests en verde; commits con mensajes claros |
| PR | Descripción: qué, por qué, cómo se probó, capturas |

## Presentación

Prepara 10 minutos para tu mentor (o grábate):

1. Demo: el flujo completo con mock y, si puedes, con el backend.
2. Recorrido del código de la petición: clic → componente → store → servicio → interceptores → mock/backend → de regreso.
3. Una decisión que tomaste y su alternativa.
4. Un bug que encontraste y el test que lo cubre.

## Autoevaluación final

1. ¿Por qué `canMatch` y no `canActivate` en la ruta de cajas?
2. ¿Qué pasaría si el mock de cajas respondiera `almacenId` en vez de `almacen_id`?
3. ¿Qué error muestra el interceptor y cuál la pantalla de cajas? ¿Por qué?
4. ¿Cómo evitaste que la tabla muestre cajas del almacén anterior si el usuario cambia rápido de almacén?
5. ¿Qué parte de tu solución cambiarías si hubiera 10 000 cajas por almacén?

**Listo cuando:** el reto C y tus extensiones pasan, la verificación completa está en verde y presentaste tu PR.

¡Cinturón negro! Ahora: el repositorio de tu equipo, un ticket chico y mucha lectura de código ajeno. Si aún no lo haces, el [Dojo Backend Go](https://github.com/VlV-515/dojo_backend_go) completa el otro lado.
