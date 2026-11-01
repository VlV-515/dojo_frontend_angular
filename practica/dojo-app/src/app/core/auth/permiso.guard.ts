import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { NotificacionService } from '@core/ui/notificacion.service';
import { Permiso } from './perfiles';
import { SesionService } from './sesion.service';

/**
 * Fábrica de guards: `canMatch: [authGuard, permisoGuard('reportes.ver')]`.
 *
 * Ocultar un botón NO es seguridad (cualquiera teclea la URL); este guard
 * tampoco lo es del todo (el código JS se puede modificar en el navegador).
 * La seguridad real la pone el backend validando cada petición. El guard es
 * experiencia de usuario: no mandarlo a una pantalla que va a fallar.
 */
export function permisoGuard(permiso: Permiso): CanMatchFn {
  return () => {
    if (inject(SesionService).tiene(permiso)) return true;
    inject(NotificacionService).error('No tienes permiso para entrar a esa pantalla');
    return inject(Router).createUrlTree(['/inicio']);
  };
}
