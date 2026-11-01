---
name: examen
description: Aplica la autoevaluación de un módulo del Dojo Frontend Angular, una pregunta a la vez, y retroalimenta cada respuesta. Úsalo con "/examen", "/examen 06", "pregúntame del módulo X", "quiero practicar para la presentación final".
---

# Examen del módulo

Argumento: número de módulo (`00`–`14`) o `final`. Si falta, usa el "Módulo actual" de `progreso.local.md`; si no existe, pregunta.

## Pasos

1. Lee `modulos/<NN>-*.md`. Toma las preguntas de "Autoevaluación" y agrega 2 preguntas propias:
   - una **práctica** ("¿qué pinta esta plantilla?", "¿qué emite este pipe de RxJS?", "¿qué status llega al componente?"), con un fragmento corto tomado o inspirado en `practica/` (katas o `dojo-app`);
   - una de **criterio de equipo** ("en un PR ves `X`, ¿qué comentarías?"), como la haría un revisor de un equipo de front Angular profesional.
   Para `final`: 8 preguntas mezcladas de todos los módulos, con peso en 06, 08, 09 y 11.

2. Haz **una pregunta a la vez**. Espera la respuesta. No muestres la siguiente hasta retroalimentar.

3. Retroalimenta cada respuesta:
   - ✅ correcta: confirma y añade un dato que la profundice (con un archivo de `practica/dojo-app` o la documentación oficial si aplica).
   - 🟡 parcial: di qué faltó y haz una repregunta.
   - ❌ incorrecta: no des la respuesta de inmediato; da una pista y deja un segundo intento. Si vuelve a fallar, explica y apunta a la sección del módulo.

4. Al final: puntaje (correctas / total), temas a repasar con su sección, y si ≥ 80 % ofrece marcar la autoevaluación con `/progreso`.

## Reglas

- Nada de opción múltiple salvo que la persona lo pida: respuestas en sus palabras.
- No uses datos sensibles (contraseñas, tokens) ni siquiera de ejemplo realista.
