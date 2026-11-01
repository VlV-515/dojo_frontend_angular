# 00 · Bienvenida

> Cinturón blanco · 1 hora

## Objetivos

- Entender qué vas a construir y por qué el dojo está armado así.
- Conocer la forma de un front Angular empresarial: muchos módulos de negocio, un equipo, un backend con varios microservicios y código que vive años.
- Dejar listo tu flujo de trabajo: bitácora, pistas y revisión.

## 1. Qué es un front "empresarial"

Una app de tutorial tiene tres pantallas y un `HttpClient`. Un front empresarial (un ERP, un punto de venta, un portal interno) tiene:

| Rasgo | Qué significa para ti |
|---|---|
| Decenas de módulos de negocio | Necesitas una estructura de carpetas que escale: `core/`, `shared/`, `features/` |
| Usuarios con permisos distintos | Guards, menús y botones que dependen del perfil |
| Un backend que responde con una envoltura (`{ codigo, mensaje, datos }`) | Servicios HTTP tipados y un manejo de errores central |
| Código que vive años | Vas a convivir con APIs viejas (`NgModule`, `*ngIf`, `UntypedFormGroup`) y nuevas (standalone, signals, `@if`) |
| Equipo de varias personas | Lint, formato, tests y revisiones de PR como regla, no como lujo |
| Varios entornos (local, pruebas, producción) | `environments`, configuraciones de build y un pipeline de CI |

El dojo te enseña **lo moderno como default** y, en cada módulo, una sección **"Lo vas a encontrar así"** con la versión legada que seguro verás en un proyecto con historia.

## 2. Qué vas a construir

- **Katas** (`practica/katas`): TypeScript y RxJS puro, con specs que empiezan en rojo.
- **dojo-app** (`practica/dojo-app`): un catálogo de almacenes con Angular 21 + Angular Material, con la arquitectura de un front empresarial: interceptores, guards de permisos, servicio HTTP tipado, formularios reactivos, tabla con filtros y paginación, lazy loading y environments.
- **Tres retos** que empiezan en rojo:
  - **A** (módulo 06): una ruta privada quedó sin guard.
  - **B** (módulo 09): desactivar almacenes de punta a punta en el front.
  - **C** (módulo 14): la feature completa de cajas.

dojo-app consume el **dojo-api** del [Dojo Backend Go](https://github.com/VlV-515/dojo_backend_go). Si haces los dos dojos, los retos B y C se corresponden: implementas el endpoint en Go y la pantalla en Angular. Si solo haces este, la app trae un **mock** que responde igual que el backend.

## 3. Cómo se trabaja

1. Lee la teoría. Abre los archivos que menciona; casi cada sección apunta a código real de `practica/`.
2. Haz los ejercicios. Si te atoras más de 20 minutos, pide una pista (`/pista` o a tu mentor).
3. Resuelve el reto del módulo y pide revisión (`/revisar-reto` o un PR a tu mentor).
4. Contesta la autoevaluación **sin ver la teoría**.
5. Marca el módulo en tu bitácora (`/progreso`).

**Los tests son la especificación.** Un ejercicio está hecho cuando su test pasa **y** puedes explicar por qué.

## 4. Cinturones

| Cinturón | Módulos | Puedes… |
|---|---|---|
| Blanco | 00–01 | Moverte en la terminal, usar git y manejar versiones de Node |
| Amarillo | 02–03 | Leer y escribir TypeScript estricto y RxJS sin miedo |
| Naranja | 04–05 | Crear componentes standalone, entender DI y detección de cambios |
| Verde | 06–07 | Proteger rutas y construir formularios con validación |
| Azul | 08–09 | Consumir APIs con interceptores y manejar estado con signals |
| Café | 10–13 | Construir UI accesible con Material, probarla, desplegarla y asegurarla |
| Negro | 14 | Entregar una feature de punta a punta lista para PR |

## 5. Tu bitácora

```bash
cp PROGRESO.plantilla.md progreso.local.md   # o usa /progreso con Claude Code
```

`progreso.local.md` está en `.gitignore`: es solo tuyo. Anota avances, pistas usadas y dudas para tu mentor. **Nunca escribas tokens ni contraseñas ahí.**

## En un proyecto real

El primer día en un equipo de front rara vez escribes código. Clonas, instalas, levantas la app, te pierdes en la estructura de carpetas y lees un par de tickets resueltos para entender cómo se trabaja. Este dojo simula ese recorrido en pequeño: cuando termines, el repositorio de tu equipo se va a sentir conocido.

## Autoevaluación

1. ¿Por qué un front empresarial necesita guards **y** validación en el backend?
2. ¿Qué ventaja tiene que el dojo traiga un mock del backend?
3. ¿Qué significa "el test es la especificación"?

**Listo cuando:** tienes tu `progreso.local.md` y sabes qué hay en `practica/`.

Siguiente: [01 · Terminal, git y Node con nvm](01-terminal-git-y-node.md)
