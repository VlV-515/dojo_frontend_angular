import { ErrorHandler, Injectable, inject } from '@angular/core';
import { NotificacionService } from '@core/ui/notificacion.service';
import { ErrorApp } from './error-app';

/**
 * Atrapa lo que nadie atrapó: excepciones en plantillas, en suscripciones sin
 * `error`, en promesas. Sin esto, el usuario ve una pantalla que "no hace nada"
 * y el error solo vive en la consola.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notificacion = inject(NotificacionService);

  handleError(error: unknown): void {
    console.error('[dojo-app] Error no controlado', error);
    if (error instanceof ErrorApp && error.notificado) return;
    this.notificacion.error('Algo salió mal. Si se repite, avisa a soporte.');
  }
}
