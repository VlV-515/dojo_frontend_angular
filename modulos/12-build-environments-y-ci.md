# 12 · Build, environments, lint y CI

> Cinturón café · 2 días

## Objetivos

- Entender `angular.json`: targets, configurations, `fileReplacements`, budgets y proxy.
- Manejar environments sin secretos y con una forma común.
- Leer la salida del build: bundle inicial, chunks lazy, hashes.
- Mantener calidad automática: ESLint, Prettier, commitlint.
- Armar un pipeline de CI y entender cómo se despliega un front estático.

## 1. `angular.json` en lo que importa

```jsonc
"build": {
  "builder": "@angular/build:application",
  "configurations": {
    "production":  { "budgets": [...], "outputHashing": "all" },
    "development": { "optimization": false, "sourceMap": true,
                     "fileReplacements": [{ "replace": "src/environments/environment.ts",
                                            "with": "src/environments/environment.development.ts" }] },
    "mock":        { /* igual, con environment.mock.ts */ }
  },
  "defaultConfiguration": "production"
},
"serve": { "options": { "proxyConfig": "proxy.conf.json" }, "configurations": { "mock": {…} } },
"lint":  { "builder": "@angular-eslint/builder:lint" }
```

| Script | Comando real |
|---|---|
| `npm start` | `ng serve` (development + proxy) |
| `npm run start:mock` | `ng serve --configuration=mock` |
| `npm run build` | `ng build` (production) |
| `npm run lint` | `ng lint` |

## 2. Environments

- [`environment.model.ts`](../practica/dojo-app/src/environments/environment.model.ts) define la **forma**: si agregas una llave y olvidas un archivo, no compila.
- `fileReplacements` cambia `environment.ts` por el de la configuración **al compilar**. No hay "leer el environment en tiempo de ejecución": cada entorno es un build distinto.
- **Todo lo que pongas en un environment termina en el bundle y cualquiera lo lee con las DevTools.** Una llave de API pública (mapas, captcha) puede ir ahí si el proveedor la restringe por dominio; un secreto, jamás.
- Valores personales (tu backend local en otro puerto) van en un archivo ignorado por git (`environment.local.ts` está en `.gitignore`) o en un `proxy.conf.json` local, nunca en el environment versionado.

Si necesitas **un solo build** para varios entornos (la misma imagen en pruebas y producción), la configuración se lee al arrancar: un `config.json` servido junto a la app y cargado con `provideAppInitializer`.

## 3. Leer el build

```bash
npm run build
```

- **Initial total**: lo que el navegador descarga antes de pintar. Es el número que vigilan los budgets (`maximumWarning` / `maximumError`).
- **Lazy chunk files**: una entrada por pantalla lazy.
- Los nombres llevan hash (`chunk-I25KD7W5.js`): si el archivo cambia, cambia el nombre, y el navegador nunca usa una versión vieja de caché. `index.html` no lleva hash: el servidor debe mandarlo **sin caché**.

Si el bundle inicial crece, busca qué se importó eager: un servicio `providedIn: 'root'` que arrastra una librería pesada, o una ruta con `component:`.

## 4. Calidad automática

| Herramienta | Qué revisa | En dojo-app |
|---|---|---|
| TypeScript `strict` + `strictTemplates` | Tipos en código y plantillas | `tsconfig.json` |
| ESLint + angular-eslint | Reglas de Angular, accesibilidad, control flow, OnPush | [`eslint.config.js`](../practica/dojo-app/eslint.config.js) |
| Prettier | Formato | `.prettierrc`, `npm run format:check` |
| commitlint + husky | Formato del mensaje de commit | (no incluido; ver lecturas) |

El formato no se discute en un PR: lo decide Prettier. Las reglas de lint se discuten **una vez** y se automatizan.

## 5. CI: lo mínimo

Un pipeline de front corre en cada PR, en una máquina limpia, lo mismo que tú en local:

```yaml
# .github/workflows/front.yml (ejemplo, no incluido en el dojo)
name: front
on: [pull_request]
jobs:
  verificar:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: practica/dojo-app } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm, cache-dependency-path: practica/dojo-app/package-lock.json }
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm test -- --ci
      - run: npm run build
```

`npm ci` (no `install`), Node desde `.nvmrc` y el build de producción al final: si pasa aquí, pasa en el despliegue.

## 6. Desplegar un front

`dist/dojo-app/browser/` son archivos estáticos: cualquier servidor web los sirve. Lo que hay que configurar:

1. `index.html` sin caché; el resto con caché larga (tienen hash).
2. Con path location, reescribir rutas desconocidas a `index.html` (con hash no hace falta).
3. Un reverse proxy que mande `/api` al backend (el equivalente de `proxy.conf.json`).
4. Un build por entorno (`ng build --configuration=…`) o configuración en tiempo de ejecución.

## Lo vas a encontrar así

- `"builder": "@angular-devkit/build-angular:browser"` (webpack). El nuevo `@angular/build:application` (esbuild) es varias veces más rápido; `ng update` ofrece migrarlo.
- Cinco o seis configuraciones casi idénticas (`dev`, `qa`, `staging`, `production`…) con su propio `environment.*.ts` y una docena de URLs de microservicios cada uno.
- Scripts de `package.json` que corren validaciones propias antes del build (índices generados, chequeos de rutas).
- Sin ESLint: solo `.editorconfig` y revisión humana.

## En un proyecto real

En el pipeline de un ERP, un PR solo se integra con build y tests en verde, y el despliegue a cada entorno es un paso aparte (a veces manual, con aprobación). Tú rara vez despliegas, pero tienes que saber qué configuración usa cada entorno para reproducir un bug: "en pruebas falla y en local no" casi siempre es un environment o un proxy distinto.

## Ejercicios — `practica/dojo-app`

1. Corre `npm run build` y `npm run build:development`. Compara tamaños y nombres. ¿Por qué el de desarrollo pesa más?
2. Agrega una llave `version: string` a `Environment` sin tocar los tres archivos y lee el error. Complétala y muéstrala en la barra.
3. Baja `maximumError` del budget inicial a `100kB` y corre el build. Regrésalo.
4. Rompe a propósito una regla de lint (por ejemplo, un `*ngIf`) y corre `npm run lint`. Lee el mensaje y arréglalo.
5. Escribe el workflow de CI del ejemplo en una rama de tu fork y ve correr el pipeline.

## Autoevaluación

1. ¿Qué hace `fileReplacements` y cuándo ocurre?
2. ¿Por qué un secreto nunca va en un environment de Angular?
3. ¿Por qué los archivos del build llevan hash y `index.html` no?
4. ¿Qué pasos mínimos corre un CI de front y en qué orden?
5. ¿Qué tienes que configurar en el servidor si usas path location?

**Listo cuando:** puedes explicar cada línea de la salida de `npm run build` y tu llave `version` aparece en la barra.

Siguiente: [13 · Seguridad en el front](13-seguridad.md)
