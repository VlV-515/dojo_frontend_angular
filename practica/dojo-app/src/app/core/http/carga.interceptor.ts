import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CargaService } from '@core/ui/carga.service';
import { finalize } from 'rxjs';
import { SIN_CARGA } from './contexto';

/**
 * Enciende el indicador global mientras haya peticiones. `finalize` corre al
 * completar, al fallar Y al cancelar (switchMap, salir de la pantalla): con
 * `tap` solo, un error dejaría el indicador encendido para siempre.
 */
export const cargaInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SIN_CARGA)) return next(req);
  const carga = inject(CargaService);
  carga.iniciar();
  return next(req).pipe(finalize(() => carga.terminar()));
};
