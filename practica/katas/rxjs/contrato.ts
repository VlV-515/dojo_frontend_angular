// Garantiza en tiempo de compilación (`npm run typecheck`) que ejercicios.ts y
// solucion.ts exportan exactamente las mismas firmas. No lo edites.
import * as ejercicios from './ejercicios';
import * as solucion from './solucion';

export const mismoContrato: typeof ejercicios = solucion;
export const mismoContratoInverso: typeof solucion = ejercicios;
