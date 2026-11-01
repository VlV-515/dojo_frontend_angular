import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { SesionService } from './sesion.service';

/**
 * Exige sesión. Es `CanMatchFn` (no `CanActivateFn`) a propósito: si no hay
 * sesión, la ruta ni siquiera hace match, así que su chunk lazy NUNCA se
 * descarga. Con canActivate el código del módulo ya viajó al navegador.
 */
export const authGuard: CanMatchFn = (_route, segmentos) => {
  if (inject(SesionService).autenticado()) return true;
  const volver = '/' + segmentos.map((s) => s.path).join('/');
  return inject(Router).createUrlTree(['/login'], { queryParams: { volver } });
};
