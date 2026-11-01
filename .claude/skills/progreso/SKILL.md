---
name: progreso
description: Muestra y actualiza el avance del alumno en el Dojo Frontend Angular (bitácora progreso.local.md). Úsalo cuando diga "/progreso", "¿en qué voy?", "¿qué sigue?", "ya terminé el módulo X", "empiezo el dojo" o al iniciar el dojo por primera vez.
---

# Progreso del dojo

Argumento opcional: lo que la persona terminó ("terminé el reto A", "módulo 03 listo").

## Pasos

1. **¿Existe `progreso.local.md`?**
   - No: confirma que está ignorado (`git check-ignore -v progreso.local.md` desde la raíz del repo; si no lo está, avisa y no lo crees hasta arreglarlo). Pregunta nombre y mentor (opcional: si estudia por su cuenta, déjalo vacío), copia `PROGRESO.plantilla.md` a `progreso.local.md`, llena nombre, fecha de inicio (hoy) y mentor.
   - Sí: léelo.

2. **Si la persona reporta que terminó algo, verifícalo antes de marcarlo:**
   - Katas: `npm run test:typescript` o `npm run test:rxjs` en `practica/katas`. Solo marca si todo pasa.
   - Retos: `npm run reto:a|b|c` en `practica/dojo-app`, y además `npm test` (la base debe seguir en verde). Solo marca si ambos pasan.
   - Autoevaluación: solo si la hizo con `/examen` o te la contó; si no, ofrece `/examen`.
   - Teoría y ejercicios de lectura: basta con su palabra, pero haz **una** pregunta corta de comprobación.
   Marca con `[x]` y pon la fecha. Actualiza "Módulo actual".

3. **Muestra el estado** en pocas líneas:
   - Cinturón actual (blanco 00–01, amarillo 02–03, naranja 04–05, verde 06–07, azul 08–09, café 10–13, negro 14).
   - Qué está hecho en el módulo actual y qué falta.
   - Siguiente paso concreto (archivo a leer o comando a correr).
   - Si hay "Dudas para el mentor" pendientes, recuérdalas.

## Reglas

- Nunca marques algo como hecho sin evidencia (tests en verde o respuesta correcta).
- No escribas secretos en la bitácora.
- No edites nada fuera de `progreso.local.md`.
