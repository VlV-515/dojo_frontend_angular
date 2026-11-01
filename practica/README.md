# Práctica

Dos proyectos Node independientes, cada uno con su `package.json` y su `package-lock.json`. Usa Node 22 (`nvm use` en la raíz del dojo) y `npm ci` en cada uno.

## `katas/` — módulos 02 y 03

```bash
cd katas
npm ci
npm run test:typescript      # módulo 02
npm run test:rxjs            # módulo 03
npm run typecheck && npm run lint
```

- `tipos.ts`: no se edita.
- `ejercicios.ts`: aquí resuelves (funciones con `// TODO`).
- `*.spec.ts`: la especificación. Léela.
- `solucion.ts`: referencia del sensei. **Solo se usa con `npm run test:solucion`**: esa configuración de Jest (`jest.solucion.config.js`) redirige `./ejercicios` a `./solucion` con `moduleNameMapper`. Es el equivalente de los build tags del dojo de backend. Intenta primero.
- `contrato.ts`: garantiza al compilar que `ejercicios.ts` y `solucion.ts` exportan lo mismo.

Es normal que `npm test` salga en rojo al principio: así empiezan las katas.

## `dojo-app/` — módulos 04 a 14

Mini app Angular 21 + Angular Material: catálogo de almacenes con la arquitectura de un front empresarial.

```
src/app/core/       auth (sesión, perfiles, guards, interceptor) · http (api-url, contexto, error, carga)
                    mock (interceptor + MockDb) · errores (ErrorApp, GlobalErrorHandler) · ui · guards
src/app/shared/     components (page-header, confirmar-dialog) · directives (siPermiso) · pipes · validators
src/app/features/   login · inicio · salud (pública) · almacenes (lista, formulario, store, servicio) · reportes
src/environments/   environment.ts (producción) · .development.ts · .mock.ts
src/testing/        helpers de pruebas
```

```bash
cd dojo-app
npm ci
npm run start:mock            # sin backend: http://localhost:4200
npm start                     # con el dojo-api en :1099 (proxy.conf.json: /api -> localhost:1099)
npm test && npm run lint && npm run format:check && npm run build    # la base está en verde
```

Token del dojo-api en local: `dojo-local-inseguro` (el mock acepta el mismo).

### Retos (specs aparte; sin pedirlos, la base queda en verde)

| Reto | Módulo | Comando |
|---|---|---|
| A · Cazador de rutas sin guard | 06 | `npm run reto:a` |
| B · Desactivar almacenes | 09 | `npm run reto:b` |
| C · Cajas de punta a punta | 14 | `npm run reto:c` |

Los specs `*.reto-X.spec.ts` están excluidos de `npm test` (`jest.config.js`) y solo los corre `jest.retos.config.js`. Empiezan en rojo hasta que los resuelves.

### Con el dojo-api

```bash
# en dojo_backend_go/practica/dojo-api
swag init -g main.go && go run main.go
# en dojo_frontend_angular/practica/dojo-app
npm start
```

Los retos B y C del front son la contraparte de los del backend: con ambos resueltos, la app funciona igual contra el mock que contra el backend.
