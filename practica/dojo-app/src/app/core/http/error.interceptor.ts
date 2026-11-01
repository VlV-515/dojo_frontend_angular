import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '@core/auth/sesion.service';
import { normalizarError } from '@core/errores/error-app';
import { NotificacionService } from '@core/ui/notificacion.service';
import { catchError, throwError } from 'rxjs';
import { SILENCIAR_ERRORES } from './contexto';

/**
 * Punto central de errores HTTP:
 *
 * 1. Normaliza cualquier error a `ErrorApp` (mensaje legible + status).
 * 2. 401: la sesión no sirve; la cierra y manda a /login.
 * 3. 0, 403 y 5xx: los muestra aquí, porque el componente no puede hacer nada útil con ellos.
 * 4. 400, 404, 409…: errores de negocio. Se propagan SIN toast: el componente
 *    los muestra junto al formulario o la tabla, donde tienen contexto.
 *
 * Siempre re-lanza el error: tragárselo (`return EMPTY`) deja al componente
 * esperando para siempre con el spinner encendido.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const notificacion = inject(NotificacionService);

  return next(req).pipe(
    catchError((respuesta: unknown) => {
      if (!(respuesta instanceof HttpErrorResponse)) return throwError(() => respuesta);
      const error = normalizarError(respuesta);
      const silenciar = req.context.get(SILENCIAR_ERRORES);

      if (error.status === 401) {
        sesion.cerrar();
        void router.navigate(['/login']);
        notificacion.error(error.message);
        error.notificado = true;
      } else if (
        !silenciar &&
        (error.status === 0 || error.status === 403 || error.status >= 500)
      ) {
        notificacion.error(error.message);
        error.notificado = true;
      }
      return throwError(() => error);
    }),
  );
};
