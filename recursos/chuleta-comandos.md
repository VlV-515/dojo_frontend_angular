# Chuleta de comandos

## Node y npm

```bash
nvm install 22 && nvm use        # versión del dojo (.nvmrc)
node -v && npm -v
npm ci                           # instala EXACTO el lock (al clonar y en CI)
npm install <paquete>@<versión>  # agrega o cambia una dependencia (modifica el lock)
npm outdated                     # qué tiene versión nueva
npm audit --omit=dev             # vulnerabilidades de lo que llega al navegador
npx <bin>                        # binario del proyecto (npx ng version)
```

## Katas (`practica/katas`)

```bash
npm run test:typescript          # módulo 02
npm run test:rxjs                # módulo 03
npx jest -t "buscador"           # un solo test por nombre
npm run typecheck && npm run lint
npm run test:solucion            # solución de referencia (después de intentar)
```

## dojo-app (`practica/dojo-app`)

```bash
npm run start:mock               # sin backend, http://localhost:4200
npm start                        # con el dojo-api en :1099 (proxy /api)
npm test                         # base en verde
npx jest almacenes               # specs cuyo archivo coincide
npm run test:coverage            # coverage/lcov-report/index.html
npm run lint                     # ng lint (angular-eslint)
npm run format                   # prettier --write
npm run format:check
npm run build                    # producción -> dist/dojo-app/browser
npm run build:development
npm run reto:a                   # reto:b, reto:c, retos (todos)
npx playwright install chromium && npm run e2e
```

## Angular CLI

```bash
npx ng generate component features/x/pages/x-lista --dry-run
npx ng generate service features/x/services/x
npx ng generate guard core/auth/x --functional
npx ng generate interceptor core/http/x --functional
npx ng update                                  # qué se puede actualizar
npx ng generate @angular/core:control-flow     # *ngIf -> @if
npx ng generate @angular/core:signal-input-migration
npx ng generate @angular/core:inject           # constructor -> inject()
```

## dojo-api (en `dojo_backend_go/practica/dojo-api`)

```bash
swag init -g main.go && go run main.go         # memoria, puerto 1099
curl -s localhost:1099/salud
curl -s -H "Authorization: Bearer dojo-local-inseguro" localhost:1099/almacenes
open http://localhost:1099/swagger/index.html
```

## git

```bash
git switch -c feature/x
git status && git diff
git add -p
git commit -m "Agrega filtro por estatus en almacenes"
git show otra-rama:ruta/al/archivo.ts           # ver sin tocar tu working tree
git stash && git stash pop
```
