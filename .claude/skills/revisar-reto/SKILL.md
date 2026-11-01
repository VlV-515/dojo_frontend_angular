---
name: revisar-reto
description: Revisa una kata o reto del Dojo Frontend Angular como lo haría un compañero de un equipo de front Angular profesional en un PR - corre tests, lint, formato y build, y da hallazgos con criterios de equipo sin reescribir el código. Úsalo con "/revisar-reto", "revisa mi código", "¿está bien mi solución?", "terminé el reto".
---

# Revisión de reto (estilo PR de equipo)

Argumento opcional: `typescript`, `rxjs`, `A`, `B`, `C`, o un módulo/ejercicio. Si falta, deduce del avance y de los cambios recientes (`git status`/`git diff` si la carpeta tiene git; si no, por fechas de archivos).

## 1. Verificación automática

Corre y reporta el resultado de cada uno (sin pegar salidas largas; cita el renglón decisivo):

| Qué | Dónde | Comando |
|---|---|---|
| Kata TypeScript | `practica/katas` | `npm run test:typescript` · `npm run typecheck` · `npm run lint` |
| Kata RxJS | `practica/katas` | `npm run test:rxjs` · `npm run typecheck` · `npm run lint` |
| Reto A | `practica/dojo-app` | `npm run reto:a` |
| Reto B | `practica/dojo-app` | `npm run reto:b` |
| Reto C | `practica/dojo-app` | `npm run reto:c` |
| Siempre en dojo-app | `practica/dojo-app` | `npm test` (la base debe seguir en verde) · `npm run lint` · `npm run format:check` · `npm run build` |

Si falta `node_modules`, corre `npm ci` antes y menciónalo. Si `node -v` no es 22.x, avísalo primero (`nvm use`).

## 2. Revisión de código

Lee los archivos que la persona cambió. Usa los criterios de "Revisar código" del `CLAUDE.md` del dojo y la rúbrica de `modulos/14-proyecto-final.md`. Para B y C revisa también el mock (`core/mock/`): debe respetar el contrato del backend.

## 3. Formato de la respuesta

1. **Veredicto:** ✅ aprobado / 🔁 casi / ❌ falta. Una línea.
2. **Bien hecho:** 2–3 puntos concretos.
3. **Hallazgos**, del más grave al menor:
   `archivo:línea — qué pasa — por qué importa en un equipo real (usuarios, PR, mantenimiento) — pregunta que lleve a corregirlo`.
4. **Para el PR:** una frase de cómo lo describiría en la sección "Cómo se probó".
5. Si está aprobado: ofrece marcarlo con `/progreso`.

## Reglas

- No reescribas su código ni pegues la versión corregida. Puedes mostrar a lo mucho una línea para ilustrar un hallazgo.
- No compares contra `soluciones/` en voz alta; úsalo solo si necesitas confirmar un comportamiento esperado.
- Si un test del dojo parece incorrecto, dilo como hallazgo del dojo, separado de la revisión.
