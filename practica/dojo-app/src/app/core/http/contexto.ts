import { HttpContext, HttpContextToken } from '@angular/common/http';

/** La petición maneja sus propios errores: el interceptor no muestra toast. */
export const SILENCIAR_ERRORES = new HttpContextToken<boolean>(() => false);

/** La petición no enciende el indicador de carga global (polling, autocompletar). */
export const SIN_CARGA = new HttpContextToken<boolean>(() => false);

/** Atajo: `http.get(url, { context: silencioso() })`. */
export function silencioso(): HttpContext {
  return new HttpContext().set(SILENCIAR_ERRORES, true);
}
