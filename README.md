# 🥋 Dojo Frontend Angular

Curso práctico, gratuito y en español para aprender **frontend con Angular a nivel empresarial**. No son ejemplos sueltos: construyes y extiendes una app con la forma que tienen los fronts de un equipo real (core/shared/features, interceptores, guards de permisos, servicios HTTP tipados, formularios reactivos, estado con signals, Angular Material, pruebas, build y CI), guiado por retos que empiezan en rojo y terminan en verde.

Es el complemento del **[Dojo Backend Go](https://github.com/VlV-515/dojo_backend_go)**: la app de este dojo consume el dojo-api de aquel. Puedes hacer uno, el otro o los dos.

**Para quién:**

- Programadores que vienen de otro framework (React, Vue, jQuery) o de backend y quieren trabajar en front con Angular.
- Quien ya hizo tutoriales de Angular y quiere dar el salto a cómo se trabaja en una empresa.
- Personas que entran a un equipo con un front Angular grande: el dojo te prepara para lo moderno **y** para el código legado que vas a encontrar.

**Qué aprendes:**

| Área | Temas |
|---|---|
| Lenguaje | TypeScript estricto: genéricos, uniones discriminadas, narrowing, `unknown`, utility types, inmutabilidad |
| Reactividad | RxJS (`switchMap` vs `concatMap` vs `exhaustMap`, errores, marble testing) y signals (`signal`, `computed`, `effect`, `toSignal`) |
| Angular | Standalone, `inject()`, `input()`/`output()`, control flow (`@if`, `@for`), detección de cambios (zone.js, OnPush, zoneless) |
| Arquitectura | `core/` · `shared/` · `features/`, lazy loading, environments, alias de rutas |
| Rutas y permisos | `canMatch`, `canDeactivate`, guards funcionales, permisos por perfil, hash vs path |
| Formularios | Reactivos tipados, validadores propios, errores del servidor en el campo, cambios sin guardar |
| HTTP | Servicios tipados, envoltura `{ codigo, mensaje, datos }`, interceptores (auth, errores, carga), `HttpContext`, proxy y CORS, mock |
| UI | Angular Material 21 (tabla, paginador, diálogos, snackbar), tema Material 3, accesibilidad, formato es-MX |
| Calidad | Jest + Testing Library, `HttpTestingController`, Playwright, ESLint + angular-eslint, Prettier, CI |
| Seguridad | XSS, tokens, open redirect, secretos en el bundle, dependencias |

## Requisitos

- **Node 22** (con [nvm](https://github.com/nvm-sh/nvm): `nvm use` lee [`.nvmrc`](.nvmrc)) y npm 10.
- git.
- macOS, Linux o Windows con WSL2.
- Opcional: Go 1.24+ y el [Dojo Backend Go](https://github.com/VlV-515/dojo_backend_go) para usar el backend real (sin él, la app trae un mock).
- Opcional pero recomendado: [Claude Code](https://claude.com/claude-code), que funciona como sensei del dojo (ver abajo).

Stack de la app: Angular 21.2 · Angular Material/CDK 21.2 · RxJS 7.8 · TypeScript 5.9 · zone.js · Jest 30 + jest-preset-angular 17 + Testing Library · ESLint 10 + angular-eslint 21 · Playwright.

## Cómo empezar

```bash
git clone https://github.com/VlV-515/dojo_frontend_angular.git
cd dojo_frontend_angular
nvm use
```

1. Lee [`modulos/00-bienvenida.md`](modulos/00-bienvenida.md).
2. Comprueba que todo instala y corre:
   ```bash
   cd practica/katas && npm ci && npm test        # en rojo: así empiezan las katas
   cd ../dojo-app && npm ci && npm test           # en verde
   npm run start:mock                             # http://localhost:4200, token: dojo-local-inseguro
   ```
3. Ten a la mano el **[cheatsheet en PDF](recursos/cheatsheet-frontend-angular.pdf)** (3 páginas, carta horizontal). Resume todo el dojo y sirve también en el día a día.

### Sin Claude Code

Funciona igual: cada módulo trae teoría, ejercicios, specs y autoevaluación. Copia [`PROGRESO.plantilla.md`](PROGRESO.plantilla.md) a `progreso.local.md` (está en `.gitignore`) y lleva ahí tu avance. Si tienes mentor, pídele revisión con un PR a tu fork.

### Con Claude Code como sensei

```bash
cd dojo_frontend_angular
claude
```

El [`CLAUDE.md`](CLAUDE.md) de esta carpeta convierte a Claude en tu **sensei**: explica, da pistas graduadas y revisa tu código como en un PR, pero **no te resuelve los retos**. Trae estos comandos:

| Comando | Qué hace |
|---|---|
| `/progreso` | Crea tu bitácora (`progreso.local.md`, no se versiona) y te dice qué sigue |
| `/pista` | Pista en 3 niveles del ejercicio en el que estás, sin darte la respuesta |
| `/revisar-reto` | Corre tests, lint, formato y build del reto y te hace code review |
| `/examen` | Autoevaluación del módulo, una pregunta a la vez |

## Ruta

| # | Módulo | Cinturón | Práctica | Tiempo |
|---|---|---|---|---|
| 00 | [Bienvenida](modulos/00-bienvenida.md) | Blanco | Lectura guiada | 1 h |
| 01 | [Terminal, git y Node con nvm](modulos/01-terminal-git-y-node.md) | Blanco | Entorno | 3–4 h |
| 02 | [TypeScript](modulos/02-typescript.md) | Amarillo | `katas/typescript` | 2–3 d |
| 03 | [RxJS](modulos/03-rxjs.md) | Amarillo | `katas/rxjs` | 3–4 d |
| 04 | [Angular fundamentos](modulos/04-angular-fundamentos.md) | Naranja | dojo-app | 2–3 d |
| 05 | [Componentes y comunicación](modulos/05-componentes-y-comunicacion.md) | Naranja | dojo-app | 2–3 d |
| 06 | [Routing, lazy loading y guards](modulos/06-routing-y-guards.md) | Verde | dojo-app · **Reto A** | 2–3 d |
| 07 | [Formularios reactivos](modulos/07-formularios.md) | Verde | dojo-app | 2–3 d |
| 08 | [HTTP, interceptores y manejo de errores](modulos/08-http-interceptores-y-errores.md) | Azul | dojo-app + dojo-api | 3 d |
| 09 | [Estado con signals](modulos/09-estado.md) | Azul | dojo-app · **Reto B** | 2–3 d |
| 10 | [Angular Material, estilos y accesibilidad](modulos/10-material-estilos-y-a11y.md) | Café | dojo-app | 2–3 d |
| 11 | [Testing](modulos/11-testing.md) | Café | specs | 3 d |
| 12 | [Build, environments, lint y CI](modulos/12-build-environments-y-ci.md) | Café | dojo-app | 2 d |
| 13 | [Seguridad en el front](modulos/13-seguridad.md) | Café | dojo-app | 1–2 d |
| 14 | [Proyecto final](modulos/14-proyecto-final.md) | Negro | **Reto C** + extensiones | 3–5 d |

Total aproximado: 5–6 semanas a medio tiempo.

## Qué hay aquí

```
dojo_frontend_angular/
├── README.md                  ← estás aquí
├── CLAUDE.md                  ← instrucciones del sensei (Claude Code)
├── PROGRESO.plantilla.md      ← plantilla de tu bitácora
├── .nvmrc                     ← Node 22
├── .claude/skills/            ← /progreso, /pista, /revisar-reto, /examen
├── modulos/                   ← 15 módulos: teoría, ejercicios, reto, autoevaluación
├── practica/
│   ├── katas/                 ← TypeScript y RxJS con specs (módulos 02–03)
│   └── dojo-app/              ← mini app Angular empresarial (módulos 04–14)
├── recursos/                  ← cheatsheet PDF, glosario, chuleta de comandos, lecturas
└── soluciones/                ← para mentores (y para ti, DESPUÉS de intentar)
```

### dojo-app en 30 segundos

Un catálogo de almacenes con Angular 21 + Material, con esta arquitectura:

```
src/app/core/      auth (sesión, perfiles, guards, interceptor) · http (errores, carga, contexto) · mock · errores · ui
src/app/shared/    page-header · confirmar-dialog · *appSiPermiso · pipes · validadores
src/app/features/  login · inicio · salud (pública) · almacenes (lista, formulario, store, servicio) · reportes
```

```bash
cd practica/dojo-app
npm run start:mock       # sin backend
npm start                # con el dojo-api en :1099 (proxy /api -> localhost:1099)
npm test && npm run lint && npm run build
npm run reto:a           # en rojo hasta que lo resuelvas
```

## Cómo se trabaja cada módulo

1. Lee la teoría y abre los archivos de `practica/` que menciona.
2. Haz los ejercicios. Si te atoras más de 20 minutos, pide una pista (`/pista` o a tu mentor).
3. Resuelve el reto. Pide revisión (`/revisar-reto` o un PR a tu mentor).
4. Contesta la autoevaluación sin ver la teoría.
5. Marca el módulo en tu bitácora.

Los specs son la especificación: un ejercicio está hecho cuando su test pasa **y** puedes explicar por qué.

## Reglas del dojo (y de cualquier equipo serio)

1. **Secretos:** ni en commits, ni en environments, ni en chats, ni en la bitácora. Todo lo que está en un environment de Angular termina en el navegador.
2. **El backend valida:** ocultar un botón o proteger una ruta es experiencia de usuario, no seguridad.
3. **Nada de producción** desde tu máquina. Si practicas contra un backend compartido, solo lectura.
4. **Intenta antes de ver la solución.** `solucion.ts` y `soluciones/` existen para comparar, no para copiar.

## Para mentores

¿Lo usas para hacer onboarding de tu equipo? Adelante.

- [`soluciones/README.md`](soluciones/README.md) explica cómo verificar katas y retos.
- Katas: `npm run test:solucion` en `practica/katas` corre las soluciones de referencia.
- Retos de dojo-app: `soluciones/dojo-app-retos.patch` (se aplica sobre una copia limpia).
- Cada módulo trae "En un proyecto real" y "Lo vas a encontrar así": úsalos para conectar con el repositorio de tu equipo.
- Para adaptarlo a tu empresa, agrega un módulo con tu repositorio, entornos, librería de componentes y proceso de despliegue. Mantenlo fuera del fork público si trae datos internos.

## Contribuir

Issues y PRs son bienvenidos: erratas, ejercicios nuevos, mejores explicaciones o traducciones. Antes de abrir un PR corre la verificación completa de [`soluciones/README.md`](soluciones/README.md) (katas en rojo sin solución y en verde con ella; dojo-app con lint, formato, tests y build en verde; retos en rojo sin patch y en verde con él). Si cambias algo del cheatsheet, regenera el PDF con `recursos/cheatsheet/generar.py`.

## Licencia

[MIT](LICENSE).
