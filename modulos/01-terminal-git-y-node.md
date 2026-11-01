# 01 · Terminal, git y Node con nvm

> Cinturón blanco · 3–4 horas

## Objetivos

- Moverte en la terminal sin depender del explorador de archivos.
- Usar git como en un equipo: ramas, commits con mensaje claro, PRs.
- Manejar la versión de Node por proyecto con **nvm** y entender `package.json`, `package-lock.json`, `npm ci` y `npm install`.

## 1. Terminal mínima

| Comando | Para qué |
|---|---|
| `pwd`, `ls -la`, `cd` | Dónde estoy, qué hay, moverme |
| `mkdir -p a/b`, `rm -r carpeta` | Crear y borrar (sin papelera: cuidado) |
| `cat`, `less`, `head`, `tail -f` | Leer archivos y logs |
| `grep -rn "texto" src/` | Buscar en el código |
| `which node`, `echo $PATH` | Saber qué binario se está usando |

En Windows usa **WSL2**: las herramientas de front (y los scripts de muchos equipos) asumen una shell tipo Unix.

## 2. Node y nvm: por qué la versión importa

Angular 21 exige Node 20.19+, 22.12+ o 24. Un equipo fija **una** versión mayor para que todos compilen igual. Este dojo usa **Node 22**, y lo dice en dos lugares:

- [`.nvmrc`](../.nvmrc): `22`. Con `nvm use` en la raíz cambias a esa versión.
- `engines` en [`package.json`](../practica/dojo-app/package.json): npm avisa si usas otra.

```bash
# Instala nvm (ver lecturas) y luego:
nvm install 22
nvm use            # lee .nvmrc
node -v            # v22.x
npm -v             # 10.x
```

**Por qué no "la última":** una versión de Node que el equipo no probó puede romper el build, las pruebas o una dependencia nativa. El síntoma típico es "en mi máquina sí funciona".

## 3. npm sin misterios

| Archivo / comando | Qué hace |
|---|---|
| `package.json` | Lo que el proyecto **pide**: dependencias, scripts, `engines` |
| `package-lock.json` | Lo que **quedó instalado**, versión exacta de todo el árbol. Se versiona |
| `npm install` | Resuelve versiones, puede **actualizar el lock**. Úsalo para agregar o cambiar dependencias |
| `npm ci` | Borra `node_modules` e instala **exactamente** el lock; falla si no coincide. Úsalo al clonar y en CI |
| `npm run <script>` | Corre un script de `package.json` (`npm test` y `npm start` son atajos) |
| `npx <bin>` | Corre un binario del proyecto (`npx ng version`) |

Versiones: `21.2.23` exacta, `^21.2.0` acepta `21.x.y` mayores, `~21.2.0` acepta `21.2.y`. En dojo-app las dependencias clave están **fijas** (sin `^`) para que todos tengan lo mismo; en tu equipo puede que veas `^`, y el lock es lo que manda.

## 4. git como en un equipo

```bash
git switch -c feature/filtro-almacenes      # una rama por tarea
git status && git diff                      # revisa ANTES de agregar
git add -p                                  # agrega por partes, no "todo"
git commit -m "Agrega filtro por estatus en almacenes"
git push -u origin feature/filtro-almacenes
```

- Un commit = un cambio con sentido. Mensaje en imperativo: "Agrega", "Corrige", "Quita".
- Muchos equipos validan el formato del mensaje con **commitlint** y un hook de **husky**. Si tu commit "no entra", lee el error: casi siempre es el formato.
- Nunca subas `node_modules/`, `dist/`, `.angular/` ni environments con secretos: para eso está [`.gitignore`](../.gitignore).
- `git checkout <rama> -- .` sobrescribe tu working tree completo. Para ver archivos de otra rama sin tocar nada usa `git show rama:ruta`.

## En un proyecto real

El README del proyecto dice qué versión de Node usar y qué script levanta cada entorno (`start:local`, `start:pruebas`…). Lo primero que vas a hacer es `nvm use && npm ci`. Si el `npm ci` falla, **no** lo "arregles" con `npm install`: eso cambia el lock y tu PR va a traer cientos de líneas que nadie pidió. Pregunta primero.

## Ejercicios

1. En la raíz del dojo: `nvm use`, luego `node -v`. ¿Qué versión quedó y por qué?
2. En `practica/katas`: `npm ci`, luego `npm test`. Debe salir **en rojo**: así empiezan las katas.
3. En `practica/dojo-app`: `npm ci`, `npm run lint`, `npm test` (verde) y `npm run build`. Abre `dist/dojo-app/browser`: ¿qué archivos generó?
4. Cambia una dependencia de `^` a versión fija en un proyecto de prueba y corre `npm install`. Mira el `git diff` del lock.
5. Crea una rama, cambia un texto en `practica/dojo-app/src/app/features/inicio/inicio.component.ts`, haz commit con un buen mensaje y regresa a `main` sin perder nada.

## Autoevaluación

1. ¿Cuándo usas `npm ci` y cuándo `npm install`?
2. ¿Por qué el `package-lock.json` sí se versiona y `node_modules` no?
3. ¿Qué hace `nvm use` y de dónde saca la versión?
4. ¿Qué significa `^21.2.0`?

**Listo cuando:** `npm ci` + `npm test` funcionan en katas (rojo) y en dojo-app (verde) con Node 22.

Siguiente: [02 · TypeScript](02-typescript.md)
