import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';
import { confirmar } from '@shared/components/confirmar-dialog/confirmar-dialog.component';

/** Lo implementa toda pantalla con un formulario que se puede perder. */
export interface ConCambiosSinGuardar {
  tieneCambiosSinGuardar(): boolean;
}

/**
 * Pregunta antes de salir de un formulario con cambios. `canDeactivate` corre
 * al navegar FUERA de la ruta (clic en el menú, botón atrás del navegador).
 */
export const cambiosSinGuardarGuard: CanDeactivateFn<ConCambiosSinGuardar> = (componente) => {
  if (!componente.tieneCambiosSinGuardar()) return true;
  return confirmar(inject(MatDialog), {
    titulo: 'Cambios sin guardar',
    mensaje: 'Si sales ahora vas a perder lo que capturaste.',
    confirmar: 'Salir sin guardar',
  });
};
