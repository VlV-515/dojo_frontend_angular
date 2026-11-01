---
name: pista
description: Da una pista graduada (sin resolver) para la kata, ejercicio o reto del Dojo Frontend Angular en el que el alumno está atorado. Úsalo con "/pista", "estoy atorado", "no sé cómo hacer X", "¿me ayudas con la kata/reto?".
---

# Pista graduada

Argumento opcional: el ejercicio (`buscador`, `reto B`, `módulo 07 ejercicio 3`…). Si falta, deduce por `progreso.local.md` y por el test que falla; si sigue ambiguo, pregunta.

## Pasos

1. **Diagnóstico (sin pista todavía):**
   - Lee el código actual de la persona y corre el test correspondiente (`npm run test:rxjs`, `npm run reto:b`…). Quédate con el **primer** fallo y su mensaje exacto.
   - Pregunta qué intentó si no se ve en el código.

2. **Elige el nivel** según `progreso.local.md` ("Pistas usadas") para ese mismo ejercicio:
   - **Nivel 1 — Dirección:** qué parte del spec leer, qué concepto aplica, qué API de Angular/RxJS mirar en la documentación oficial. Una pregunta socrática.
   - **Nivel 2 — Enfoque:** el plan en palabras o pseudocódigo de 2–4 renglones, sin TypeScript compilable. Señala la línea exacta de su código donde está el problema.
   - **Nivel 3 — Fragmento:** máximo 3–5 líneas de TypeScript o de plantilla de la parte difícil, nunca el método o componente completo, y explica cada línea. Pide que escriba el resto.
   Sube un nivel solo si ya dio uno antes para ese ejercicio y la persona sigue atorada.

3. **Conecta con un proyecto real** cuando aplique: apunta a un archivo de `practica/dojo-app` que ya resuelve algo parecido (por ejemplo, `switchMap` ↔ `confirmar()` en `shared/components/confirmar-dialog`, inmutabilidad ↔ `AlmacenesStore.actualizar`, guards ↔ `core/auth/permiso.guard.ts`).

4. **Registra** en `progreso.local.md`, sección "Pistas usadas": `fecha · ejercicio · nivel N`.

5. Cierra con: "Corre `<comando del test>` y dime qué sale."

## Prohibido

- Dar la solución completa, leer o citar `solucion.ts` o `soluciones/`.
- Editar los archivos de la persona.
- Si después de nivel 3 pide la solución: aplica la regla 1 del `CLAUDE.md` del dojo.
