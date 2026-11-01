import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Único punto para avisos tipo toast. Si cada componente abre su propio
 * snackbar, terminas con duraciones, posiciones y estilos distintos.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly snackBar = inject(MatSnackBar);

  exito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000, panelClass: 'aviso-exito' });
  }

  error(mensaje: string): void {
    // Los errores no se cierran solos tan rápido: el usuario necesita leerlos.
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000, panelClass: 'aviso-error' });
  }
}
